import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/logbook/my - Student fetches their own weekly logs & progress
router.get('/my', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            jobPost: {
              include: {
                company: true
              }
            },
            evaluation: true
          }
        }
      }
    });

    if (!student) {
      student = await prisma.studentProfile.create({
        data: {
          userId: userId!,
          major: 'General',
          faculty: 'General'
        },
        include: {
          applications: {
            where: {
              status: 'ACCEPTED'
            },
            include: {
              jobPost: {
                include: {
                  company: true
                }
              },
              evaluation: true
            }
          }
        }
      });
    }

    const logs = await prisma.weeklyLog.findMany({
      where: { studentId: student.id },
      orderBy: { weekNumber: 'asc' }
    });

    const totalHours = logs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);
    const approvedHours = logs.filter(l => l.mentorApproved).reduce((acc, log) => acc + (log.hoursWorked || 0), 0);

    const activePlacement = student.applications[0] || null;

    res.json({
      student,
      logs,
      totalHours,
      approvedHours,
      activePlacement
    });
  } catch (error) {
    console.error('Error fetching student logbook:', error);
    res.status(500).json({ error: 'Failed to fetch logbook data.' });
  }
});

// POST /api/logbook - Student submits or updates a weekly log
router.post('/', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { 
      id, 
      weekNumber, 
      startDate, 
      endDate, 
      workModality,
      supervisorName,
      plannedTasks,
      tasksDone, 
      problemsAndSolutions,
      learnings, 
      hoursWorked, 
      attachmentUrl 
    } = req.body;

    let student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          where: {
            status: 'ACCEPTED'
          }
        }
      }
    });

    if (!student) {
      student = await prisma.studentProfile.create({
        data: {
          userId: userId!,
          major: 'General',
          faculty: 'General'
        },
        include: {
          applications: {
            where: {
              status: 'ACCEPTED'
            }
          }
        }
      });
    }

    const activeApp = student.applications[0] || null;

    if (!activeApp) {
      res.status(403).json({
        error: 'You cannot submit weekly logbook entries without an accepted internship placement from a company.'
      });
      return;
    }

    const parsedStartDate = startDate && !isNaN(new Date(startDate).getTime())
      ? new Date(startDate)
      : new Date();
    const parsedEndDate = endDate && !isNaN(new Date(endDate).getTime())
      ? new Date(endDate)
      : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const safeHours = Number(hoursWorked) > 0 ? Number(hoursWorked) : 40.0;
    const safeWeek = Number(weekNumber) > 0 ? Number(weekNumber) : 1;

    if (id) {
      // Update existing log
      const updated = await prisma.weeklyLog.update({
        where: { id },
        data: {
          weekNumber: safeWeek,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          workModality: workModality || 'ON_SITE',
          supervisorName: supervisorName || null,
          plannedTasks: plannedTasks || null,
          tasksDone: tasksDone || '[]',
          problemsAndSolutions: problemsAndSolutions || null,
          learnings: learnings || '',
          hoursWorked: safeHours,
          attachmentUrl: attachmentUrl || null
        }
      });
      res.json(updated);
      return;
    }

    // Create new log
    const created = await prisma.weeklyLog.create({
      data: {
        studentId: student.id,
        applicationId: activeApp ? activeApp.id : null,
        weekNumber: safeWeek,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        workModality: workModality || 'ON_SITE',
        supervisorName: supervisorName || null,
        plannedTasks: plannedTasks || null,
        tasksDone: tasksDone || '[]',
        problemsAndSolutions: problemsAndSolutions || null,
        learnings: learnings || '',
        hoursWorked: safeHours,
        attachmentUrl: attachmentUrl || null
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error saving weekly log:', error);
    res.status(500).json({ error: 'Failed to save weekly log.' });
  }
});

// DELETE /api/logbook/:id - Student deletes a weekly log
router.delete('/:id', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const log = await prisma.weeklyLog.findUnique({ where: { id } });
    if (!log || log.studentId !== student.id) {
      res.status(404).json({ error: 'Log entry not found or unauthorized.' });
      return;
    }

    await prisma.weeklyLog.delete({ where: { id } });
    res.json({ message: 'Log entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting weekly log:', error);
    res.status(500).json({ error: 'Failed to delete weekly log.' });
  }
});

// GET /api/logbook/student/:studentId - Company HR views a student's logs
router.get('/student/:studentId', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const logs = await prisma.weeklyLog.findMany({
      where: { studentId },
      orderBy: { weekNumber: 'asc' }
    });

    const totalHours = logs.reduce((acc, log) => acc + log.hoursWorked, 0);
    const approvedHours = logs.filter(l => l.mentorApproved).reduce((acc, log) => acc + log.hoursWorked, 0);

    res.json({
      student,
      logs,
      totalHours,
      approvedHours,
      targetHours: 400
    });
  } catch (error) {
    console.error('Error fetching student logs:', error);
    res.status(500).json({ error: 'Failed to fetch student logs.' });
  }
});

// PUT /api/logbook/:id/approve - Company HR approves a weekly log with rating
router.put('/:id/approve', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { mentorFeedback, mentorRating } = req.body;

    const updated = await prisma.weeklyLog.update({
      where: { id },
      data: {
        mentorApproved: true,
        mentorFeedback: mentorFeedback || null,
        mentorRating: mentorRating ? Number(mentorRating) : null
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error approving weekly log:', error);
    res.status(500).json({ error: 'Failed to approve weekly log.' });
  }
});



export default router;
