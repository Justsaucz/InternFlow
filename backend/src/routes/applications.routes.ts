import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role, ApplicationStatus } from '@prisma/client';
import { HttpError, activeStatuses, withStudentLock, handleRouteError } from '../lib/workflow';

const router = Router();

// POST - Student applies for a job with multi-attachment pinpoint documents & links
router.post('/', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobPostId, coverLetter, cvUrl, attachments } = req.body;
    if (typeof jobPostId !== 'string' || (coverLetter != null && typeof coverLetter !== 'string') ||
        (attachments != null && (!Array.isArray(attachments) || attachments.some((att: any) =>
          !att || typeof att.url !== 'string' || (att.title != null && typeof att.title !== 'string'))))) {
      throw new HttpError(400, 'Invalid application data.');
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
      return;
    }

    const targetJob = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
      include: { company: { select: { companyName: true } } }
    });
    if (!targetJob || !targetJob.isActive) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if student already has a COMMITTED placement
    const currentActive = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: { in: ['COMMITTED', 'CANCEL_REQUESTED'] }
      },
      include: { jobPost: { include: { company: true } } }
    });
    if (currentActive) {
      res.status(400).json({ 
        error: `You already have an active internship placement at ${currentActive.jobPost.company.companyName}. You cannot apply to new jobs until your current placement is cancelled and approved by the company.` 
      });
      return;
    }

    // 1. Check if student already applied to this specific job
    const existingApplication = await prisma.application.findFirst({
      where: { studentId: student.id, jobPostId }
    });
    if (existingApplication) {
      res.status(400).json({ error: 'You have already applied to this job.' });
      return;
    }

    // 2. Check if student already has an active application with this same company
    const existingCompanyApp = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        jobPost: { companyProfileId: targetJob.companyProfileId },
        status: { in: ['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'ACCEPTED'] }
      },
      include: { jobPost: { select: { title: true } } }
    });
    if (existingCompanyApp) {
      res.status(400).json({ 
        error: `You already have an active application (${existingCompanyApp.jobPost.title}) with ${targetJob.company.companyName}. You can only have 1 active application per company at a time.` 
      });
      return;
    }

    // Create Application and Documents in a transaction
    const application = await withStudentLock(student.id, async (tx) => {
      const active = await tx.application.findFirst({ where: { studentId: student.id, status: { in: activeStatuses } } });
      if (active) throw new HttpError(409, 'You already have an active placement.');
      const job = await tx.jobPost.findUnique({ where: { id: jobPostId } });
      if (!job?.isActive) throw new HttpError(409, 'This job is no longer accepting applications.');
      const companyApp = await tx.application.findFirst({ where: {
        studentId: student.id, jobPost: { companyProfileId: job.companyProfileId },
        status: { in: ['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'ACCEPTED'] }
      } });
      if (companyApp) throw new HttpError(409, 'You already have an active application with this company.');
      const app = await tx.application.create({
        data: {
          jobPostId,
          studentId: student.id,
          coverLetter: coverLetter || null,
        }
      });

      if (Array.isArray(attachments) && attachments.length > 0 && userId) {
        for (const att of attachments) {
          if (att.url && typeof att.url === 'string' && att.url.trim().length > 0) {
            const title = att.title && att.title.trim() ? att.title.trim() : 'Document';
            const isCV = title.toLowerCase().includes('cv') || title.toLowerCase().includes('resume');
            await tx.document.create({
              data: {
                userId,
                applicationId: app.id,
                title,
                fileUrl: att.url.trim(),
                type: isCV ? 'CV' : 'REPORT'
              }
            });
          }
        }
      } else if (cvUrl && userId) {
        await tx.document.create({
          data: {
            userId: userId,
            applicationId: app.id,
            title: 'Resume/CV',
            fileUrl: cvUrl,
            type: 'CV'
          }
        });
      }

      return app;
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    handleRouteError(res, error, 'Failed to submit application.');
  }
});

// GET - Student views their own applications
router.get('/my', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        documents: true,
        jobPost: {
          include: {
            company: { select: { id: true, companyName: true, logoUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Company HR views applicants for their jobs
router.get('/company', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: {
        jobPost: { companyProfileId: company.id }
      },
      include: {
        jobPost: { select: { title: true } },
        documents: true,
        student: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH - Company HR advances only applications owned by their company.
router.patch('/:id/status', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const transitions: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
      PENDING: ['REVIEWING', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'],
      REVIEWING: ['INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'],
      INTERVIEW_SCHEDULED: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['REJECTED']
    };
    if (!['REVIEWING', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(status)) throw new HttpError(400, 'Invalid application status.');
    const owned = await prisma.application.findFirst({ where: { id, jobPost: { company: { userId: req.user!.userId } } } });
    if (!owned) throw new HttpError(404, 'Application not found.');
    const application = await withStudentLock(owned.studentId, async tx => {
      const current = await tx.application.findUnique({ where: { id } });
      if (!current) throw new HttpError(404, 'Application not found.');
      if (!transitions[current.status]?.includes(status)) throw new HttpError(409, 'This application can no longer make that status change.');
      if (status !== 'REJECTED') {
        const active = await tx.application.findFirst({ where: { studentId: current.studentId, status: { in: activeStatuses } } });
        if (active) throw new HttpError(409, 'This student already has an active placement.');
      }
      return tx.application.update({ where: { id }, data: { status } });
    });
    res.json(application);
  } catch (error) { handleRouteError(res, error, 'Failed to update application.'); }
});

// PATCH - Student commits to ONE accepted offer (Accept Offer & Start Internship)
router.patch('/:id/commit', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const targetApp = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: { include: { company: true } } }
    });

    if (!targetApp || targetApp.studentId !== student.id) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (targetApp.status !== 'ACCEPTED') {
      res.status(400).json({ error: 'You can only commit to an application that has been accepted by the company.' });
      return;
    }

    // Check if student already has a COMMITTED or CANCEL_REQUESTED placement
    const existingActive = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: { in: ['COMMITTED', 'CANCEL_REQUESTED'] }
      },
      include: { jobPost: { include: { company: true } } }
    });

    if (existingActive) {
      res.status(400).json({
        error: `You are already committed to an internship at ${existingActive.jobPost.company.companyName}. You cannot commit to another company until your current placement is cancelled and approved by the company.`
      });
      return;
    }

    // Execute in transaction: Commit this application, auto-decline/close all others
    const committedApp = await withStudentLock(student.id, async (tx) => {
      const target = await tx.application.findFirst({ where: { id, studentId: student.id }, include: { jobPost: true } });
      if (!target || target.status !== 'ACCEPTED') throw new HttpError(409, 'This offer is no longer available.');
      await tx.$queryRaw`SELECT id FROM "JobPost" WHERE id = ${target.jobPostId} FOR UPDATE`;
      const active = await tx.application.findFirst({ where: { studentId: student.id, status: { in: activeStatuses } } });
      if (active) throw new HttpError(409, 'You already have an active placement.');
      // 1. Commit target
      const updated = await tx.application.update({
        where: { id },
        data: { status: 'COMMITTED' },
        include: { jobPost: { include: { company: true } } }
      });

      // 2. Auto-close all other applications for this student
      await tx.application.updateMany({
        where: {
          studentId: student.id,
          id: { not: id },
          status: { in: ['ACCEPTED', 'PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED'] }
        },
        data: {
          status: 'REJECTED',
          cancellationReason: 'Student confirmed and committed to another company offer'
        }
      });

      return updated;
    });

    res.json({
      message: `Successfully confirmed placement at ${committedApp.jobPost.company.companyName}!`,
      application: committedApp
    });
  } catch (error) {
    handleRouteError(res, error, 'Failed to confirm placement.');
  }
});

// PATCH - Student requests cancellation of committed internship
router.patch('/:id/request-cancel', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      res.status(400).json({ error: 'Please provide a clear reason for requesting cancellation.' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const targetApp = await prisma.application.findUnique({
      where: { id }
    });

    if (!targetApp || targetApp.studentId !== student.id) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (targetApp.status !== 'COMMITTED') {
      res.status(400).json({ error: 'Only committed active internships can request cancellation.' });
      return;
    }

    const updated = await withStudentLock(student.id, async tx => {
      const result = await tx.application.updateMany({
        where: { id, studentId: student.id, status: 'COMMITTED' },
        data: { status: 'CANCEL_REQUESTED', cancellationReason: reason.trim() }
      });
      if (!result.count) throw new HttpError(409, 'Placement status has changed. Refresh and try again.');
      return tx.application.findUnique({ where: { id } });
    });

    res.json({
      message: 'Cancellation request submitted. Waiting for company HR to review and confirm.',
      application: updated
    });
  } catch (error) {
    handleRouteError(res, error, 'Failed to request cancellation.');
  }
});

// PATCH - Company HR confirms or rejects cancellation request
router.patch('/:id/cancellation-action', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      res.status(400).json({ error: 'Invalid action. Must be APPROVE or REJECT.' });
      return;
    }

    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPost: true }
    });

    if (!application || application.jobPost.companyProfileId !== company.id) {
      res.status(403).json({ error: 'Unauthorized to review this application' });
      return;
    }

    if (application.status !== 'CANCEL_REQUESTED') {
      res.status(400).json({ error: 'Application does not have a pending cancellation request.' });
      return;
    }

    const nextStatus: ApplicationStatus = action === 'APPROVE' ? 'CANCELLED' : 'COMMITTED';
    const updated = await withStudentLock(application.studentId, async tx => {
      const result = await tx.application.updateMany({
        where: { id, status: 'CANCEL_REQUESTED', jobPost: { companyProfileId: company.id } },
        data: { status: nextStatus }
      });
      if (!result.count) throw new HttpError(409, 'Cancellation status has changed. Refresh and try again.');
      return tx.application.findUnique({ where: { id } });
    });

    res.json({
      message: action === 'APPROVE' ? 'Cancellation approved. Student has been released.' : 'Cancellation request rejected. Placement remains active.',
      application: updated
    });
  } catch (error) {
    handleRouteError(res, error, 'Failed to review cancellation.');
  }
});

export default router;
