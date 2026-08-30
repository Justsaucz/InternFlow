import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role, ApplicationStatus } from '@prisma/client';

const router = Router();

// POST - Student applies for a job with multi-attachment pinpoint documents & links
router.post('/', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobPostId, coverLetter, cvUrl, attachments } = req.body;

    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
      return;
    }

    const targetJob = await prisma.jobPost.findUnique({
      where: { id: jobPostId },
      include: { company: { select: { companyName: true } } }
    });
    if (!targetJob) {
      res.status(404).json({ error: 'Job not found' });
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
        status: { in: ['PENDING', 'REVIEWING', 'ACCEPTED', 'APPROVED_BY_UNIVERSITY'] }
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
    const application = await prisma.$transaction(async (tx) => {
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
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// PATCH - Company HR updates application status (Accept/Reject)
router.patch('/:id/status', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
    const { status } = req.body;

    const validStatuses: ApplicationStatus[] = ['REVIEWING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be REVIEWING, ACCEPTED, or REJECTED.' });
      return;
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - University Admin views all applications for their university's students
router.get('/university', authenticate, authorize([Role.UNIVERSITY_ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const admin = await prisma.user.findUnique({ where: { id: userId } });

    if (!admin || !admin.universityId) {
      res.status(404).json({ error: 'University not associated with this admin' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: {
        student: { universityId: admin.universityId }
      },
      include: {
        documents: true,
        jobPost: {
          include: {
            company: { select: { companyName: true, logoUrl: true } }
          }
        },
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

// PATCH - University Admin approves an accepted application
router.patch('/:id/approve', authenticate, authorize([Role.UNIVERSITY_ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.status !== 'ACCEPTED') {
      res.status(400).json({ error: 'Can only approve applications that have been accepted by the company.' });
      return;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'APPROVED_BY_UNIVERSITY' }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
