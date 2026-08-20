import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET all students in the admin's university
router.get('/students', authenticate, authorize([Role.UNIVERSITY_ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const admin = await prisma.user.findUnique({ where: { id: userId } });

    if (!admin || !admin.universityId) {
      res.status(404).json({ error: 'University not associated with this admin' });
      return;
    }

    const students = await prisma.studentProfile.findMany({
      where: { universityId: admin.universityId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { user: { name: 'asc' } }
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
