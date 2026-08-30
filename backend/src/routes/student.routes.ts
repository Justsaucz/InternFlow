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
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        university: { select: { id: true, name: true, logoUrl: true } }
      }
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({
      ...profile,
      avatarUrl: profile.avatarUrl || profile.user.avatarUrl || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Student Profile
router.put('/profile', authenticate, authorize([Role.STUDENT]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, studentId, major, faculty, year, gpa, bio, skills, avatarUrl } = req.body;

    if (name || avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
        }
      });
    }

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        studentId,
        major,
        faculty,
        year: year ? parseInt(year) : undefined,
        gpa: gpa !== undefined && gpa !== '' ? parseFloat(gpa) : undefined,
        bio,
        skills: Array.isArray(skills) ? skills : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        university: { select: { id: true, name: true } }
      }
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
