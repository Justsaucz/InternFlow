import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// Helper to group daily logs by week
function groupLogsByWeek(dailyLogs: any[]) {
  const weekMap = new Map<number, any>();

  for (const log of dailyLogs) {
    const week = log.weekNumber || 1;
    if (!weekMap.has(week)) {
      weekMap.set(week, {
        weekNumber: week,
        startDate: log.logDate,
        endDate: log.logDate,
        totalHours: 0,
        approvedHours: 0,
        mentorApproved: true, // will be false if any day is not approved
        hasBackdated: false,
        mentorRating: null,
        mentorFeedback: null,
        days: []
      });
    }

    const group = weekMap.get(week);
    group.days.push(log);
    group.totalHours += (log.hoursWorked || 0);
    if (log.mentorApproved) {
      group.approvedHours += (log.hoursWorked || 0);
    } else {
      group.mentorApproved = false;
    }
    if (log.isBackdated) {
      group.hasBackdated = true;
    }
    if (log.mentorRating) {
      group.mentorRating = log.mentorRating;
    }
    if (log.mentorFeedback) {
      group.mentorFeedback = log.mentorFeedback;
    }

    const logTime = new Date(log.logDate).getTime();
    if (logTime < new Date(group.startDate).getTime()) {
      group.startDate = log.logDate;
    }
    if (logTime > new Date(group.endDate).getTime()) {
      group.endDate = log.logDate;
    }
  }

  // Sort weeks in ascending or descending order
  return Array.from(weekMap.values()).sort((a, b) => b.weekNumber - a.weekNumber);
}

// GET /api/logbook/my - Student fetches their own daily logs & grouped weeks
router.get('/my', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          where: {
            status: { in: ['COMMITTED', 'CANCEL_REQUESTED'] }
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
              status: { in: ['COMMITTED', 'CANCEL_REQUESTED'] }
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

    const dailyLogs = await prisma.dailyLog.findMany({
      where: { studentId: student.id },
      orderBy: { logDate: 'desc' }
    });

    const totalHours = dailyLogs.reduce((acc, log) => acc + (log.hoursWorked || 0), 0);
    const approvedHours = dailyLogs.filter(l => l.mentorApproved).reduce((acc, log) => acc + (log.hoursWorked || 0), 0);
    const activePlacement = student.applications[0] || null;
    const groupedWeeks = groupLogsByWeek(dailyLogs);

    res.json({
      student,
      logs: dailyLogs,
      groupedWeeks,
      totalHours,
      approvedHours,
      targetHours: 400,
      activePlacement
    });
  } catch (error) {
    console.error('Error fetching student logbook:', error);
    res.status(500).json({ error: 'Failed to fetch logbook data.' });
  }
});

// POST /api/logbook - Student submits or updates a daily log
router.post('/', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { 
      id, 
      logDate, 
      weekNumber, 
      workModality,
      supervisorName,
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
            status: { in: ['COMMITTED', 'CANCEL_REQUESTED'] }
          }
        }
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const activeApp = student.applications[0] || null;

    if (!activeApp) {
      res.status(403).json({
        error: 'You cannot submit daily logbook entries without an active committed internship placement. Please accept a company offer in My Applications first.'
      });
      return;
    }

    if (!logDate) {
      res.status(400).json({ error: 'Please select a valid work date (logDate).' });
      return;
    }

    const targetDate = new Date(logDate);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid log date provided.' });
      return;
    }

    // Disallow future dates
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (targetDate.getTime() > endOfToday.getTime()) {
      res.status(400).json({ error: 'Cannot submit daily log for a future date.' });
      return;
    }

    // Determine if backdated (logged after the work date)
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const todayDateStr = now.toISOString().split('T')[0];
    const isBackdated = targetDateStr < todayDateStr;

    // Validate hours (1 to 12 hours, default 8.0)
    const rawHours = Number(hoursWorked);
    const safeHours = !isNaN(rawHours) && rawHours >= 1 && rawHours <= 12 ? rawHours : 8.0;

    // Calculate or use weekNumber
    let safeWeek = Number(weekNumber);
    if (isNaN(safeWeek) || safeWeek <= 0) {
      // Find latest week or calculate from existing logs
      const latestLog = await prisma.dailyLog.findFirst({
        where: { studentId: student.id },
        orderBy: { weekNumber: 'desc' }
      });
      safeWeek = latestLog?.weekNumber || 1;
    }

    if (id) {
      // Update existing daily log
      const updated = await prisma.dailyLog.update({
        where: { id },
        data: {
          logDate: targetDate,
          weekNumber: safeWeek,
          workModality: workModality || 'ON_SITE',
          supervisorName: supervisorName || null,
          tasksDone: tasksDone || '[]',
          problemsAndSolutions: problemsAndSolutions || null,
          learnings: learnings || '',
          hoursWorked: safeHours,
          attachmentUrl: attachmentUrl || null,
          isBackdated: isBackdated
        }
      });
      res.json(updated);
      return;
    }

    // Check if daily log already exists for this date
    // Normalize targetDate to midnight UTC for unique comparison
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        studentId: student.id,
        logDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingLog) {
      res.status(400).json({
        error: `A daily log already exists for ${targetDateStr}. You can edit the existing entry instead.`
      });
      return;
    }

    // Create new daily log
    const created = await prisma.dailyLog.create({
      data: {
        studentId: student.id,
        applicationId: activeApp ? activeApp.id : null,
        logDate: targetDate,
        weekNumber: safeWeek,
        workModality: workModality || 'ON_SITE',
        supervisorName: supervisorName || null,
        tasksDone: tasksDone || '[]',
        problemsAndSolutions: problemsAndSolutions || null,
        learnings: learnings || '',
        hoursWorked: safeHours,
        attachmentUrl: attachmentUrl || null,
        isBackdated: isBackdated
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error saving daily log:', error);
    res.status(500).json({ error: 'Failed to save daily log.' });
  }
});

// DELETE /api/logbook/:id - Student deletes a daily log
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

    const log = await prisma.dailyLog.findUnique({ where: { id } });
    if (!log || log.studentId !== student.id) {
      res.status(404).json({ error: 'Log entry not found or unauthorized.' });
      return;
    }

    await prisma.dailyLog.delete({ where: { id } });
    res.json({ message: 'Daily log entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    res.status(500).json({ error: 'Failed to delete daily log.' });
  }
});

// GET /api/logbook/student/:studentId - Company HR views a student's daily logs
router.get('/student/:studentId', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const dailyLogs = await prisma.dailyLog.findMany({
      where: { studentId },
      orderBy: { logDate: 'desc' }
    });

    const totalHours = dailyLogs.reduce((acc, log) => acc + log.hoursWorked, 0);
    const approvedHours = dailyLogs.filter(l => l.mentorApproved).reduce((acc, log) => acc + log.hoursWorked, 0);
    const groupedWeeks = groupLogsByWeek(dailyLogs);

    res.json({
      student,
      logs: dailyLogs,
      groupedWeeks,
      totalHours,
      approvedHours,
      targetHours: 400
    });
  } catch (error) {
    console.error('Error fetching student daily logs:', error);
    res.status(500).json({ error: 'Failed to fetch student daily logs.' });
  }
});

// PUT or POST /api/logbook/:id/approve - Company HR approves an individual daily log
const approveSingleLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { mentorFeedback, mentorRating } = req.body;

    const updated = await prisma.dailyLog.update({
      where: { id },
      data: {
        mentorApproved: true,
        mentorFeedback: mentorFeedback || null,
        mentorRating: mentorRating ? Number(mentorRating) : null
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error approving daily log:', error);
    res.status(500).json({ error: 'Failed to approve daily log.' });
  }
};

router.put('/:id/approve', authenticate, authorize([Role.COMPANY_HR]), approveSingleLog);
router.post('/:id/approve', authenticate, authorize([Role.COMPANY_HR]), approveSingleLog);
router.post('/approve/:id', authenticate, authorize([Role.COMPANY_HR]), approveSingleLog);

// POST /api/logbook/batch-approve - Company HR batch approves an entire week's daily logs
router.post('/batch-approve', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, weekNumber, mentorRating, mentorFeedback } = req.body;

    if (!studentId || !weekNumber) {
      res.status(400).json({ error: 'Student ID and week number are required.' });
      return;
    }

    const ratingNum = mentorRating ? Number(mentorRating) : null;
    const feedbackStr = mentorFeedback ? String(mentorFeedback).trim() : null;

    await prisma.dailyLog.updateMany({
      where: {
        studentId,
        weekNumber: Number(weekNumber)
      },
      data: {
        mentorApproved: true,
        mentorRating: ratingNum,
        mentorFeedback: feedbackStr
      }
    });

    const updatedLogs = await prisma.dailyLog.findMany({
      where: {
        studentId,
        weekNumber: Number(weekNumber)
      },
      orderBy: { logDate: 'asc' }
    });

    res.json({
      message: `Week ${weekNumber} successfully verified and approved!`,
      updatedCount: updatedLogs.length,
      logs: updatedLogs
    });
  } catch (error) {
    console.error('Error batch approving logs:', error);
    res.status(500).json({ error: 'Failed to batch approve week.' });
  }
});

export default router;
