import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET Student Profile
router.get('/profile', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        university: { select: { name: true } }
      }
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Student Profile
router.put('/profile', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { studentId, major, faculty, year, gpa, bio, skills } = req.body;

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        studentId,
        major,
        faculty,
        year,
        gpa,
        bio,
        skills
      }
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
