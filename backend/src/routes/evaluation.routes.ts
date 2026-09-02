import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role, EvaluationStatus } from '@prisma/client';

const router = Router();

// Handler function for fetching company interns
const getCompanyInternsHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const company = await prisma.companyProfile.findUnique({
      where: { userId }
    });

    if (!company) {
      res.status(404).json({ error: 'Company profile not found.' });
      return;
    }

    // Find all committed, cancel_requested or accepted applications for this company
    const applications = await prisma.application.findMany({
      where: {
        jobPost: { companyProfileId: company.id },
        status: { in: ['COMMITTED', 'CANCEL_REQUESTED', 'ACCEPTED'] }
      },
      include: {
        jobPost: true,
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            weeklyLogs: {
              orderBy: { weekNumber: 'asc' }
            },
            evaluations: {
              where: { companyId: company.id }
            }
          }
        },
        evaluation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const interns = applications.map((app) => {
      const logs = app.student.weeklyLogs;
      const totalHours = logs.reduce((sum, l) => sum + l.hoursWorked, 0);
      const approvedHours = logs.filter(l => l.mentorApproved).reduce((sum, l) => sum + l.hoursWorked, 0);

      return {
        applicationId: app.id,
        status: app.status,
        jobTitle: app.jobPost.title,
        student: app.student,
        totalHours,
        approvedHours,
        targetHours: 400,
        evaluation: app.evaluation || app.student.evaluations[0] || null
      };
    });

    res.json(interns);
  } catch (error) {
    console.error('Error fetching company interns:', error);
    res.status(500).json({ error: 'Failed to fetch interns.' });
  }
};

// GET /api/evaluations/company - Company HR gets their active intern roster & evaluation status
router.get('/company', authenticate, authorize([Role.COMPANY_HR]), getCompanyInternsHandler);

// GET /api/evaluations/company/interns - Alias endpoint for frontend compatibility
router.get('/company/interns', authenticate, authorize([Role.COMPANY_HR]), getCompanyInternsHandler);

// POST /api/evaluations/submit - Company HR submits evaluation
router.post('/submit', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { 
      studentId, 
      applicationId, 
      workQualityScore, 
      punctualityScore, 
      teamworkScore, 
      feedback 
    } = req.body;

    const company = await prisma.companyProfile.findUnique({
      where: { userId }
    });

    if (!company) {
      res.status(404).json({ error: 'Company profile not found.' });
      return;
    }

    // Check if evaluation exists
    const existing = await prisma.internshipEvaluation.findFirst({
      where: {
        studentId,
        companyId: company.id
      }
    });

    if (existing) {
      const updated = await prisma.internshipEvaluation.update({
        where: { id: existing.id },
        data: {
          workQualityScore: Number(workQualityScore),
          punctualityScore: Number(punctualityScore),
          teamworkScore: Number(teamworkScore),
          feedback,
          status: EvaluationStatus.COMPANY_EVALUATED
        }
      });
      res.json(updated);
      return;
    }

    const created = await prisma.internshipEvaluation.create({
      data: {
        studentId,
        companyId: company.id,
        applicationId: applicationId || null,
        workQualityScore: Number(workQualityScore),
        punctualityScore: Number(punctualityScore),
        teamworkScore: Number(teamworkScore),
        feedback,
        status: EvaluationStatus.COMPANY_EVALUATED
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ error: 'Failed to submit evaluation.' });
  }
});



// GET /api/evaluations/report/:studentId - Full official completion report summary
router.get('/report/:studentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true } },
        weeklyLogs: {
          orderBy: { weekNumber: 'asc' }
        },
        evaluations: {
          include: {
            company: true
          }
        },
        applications: {
          where: { status: { in: ['COMMITTED', 'CANCEL_REQUESTED', 'ACCEPTED'] } },
          include: {
            jobPost: {
              include: {
                company: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student placement not found.' });
      return;
    }

    const studentAny = student as any;
    const activeApp = studentAny.applications ? studentAny.applications[0] : null;
    const evaluation = studentAny.evaluations ? studentAny.evaluations[0] : null;
    const logs = studentAny.weeklyLogs || [];
    const totalHours = logs.reduce((sum: number, l: any) => sum + l.hoursWorked, 0);

    res.json({
      student,
      activeApp,
      evaluation,
      totalHours,
      weeklyLogs: logs
    });
  } catch (error) {
    console.error('Error generating completion report:', error);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
});

export default router;
