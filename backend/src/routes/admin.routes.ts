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

// GET University Admin Profile
router.get('/profile', authenticate, authorize([Role.UNIVERSITY_ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const admin = await prisma.user.findUnique({
      where: { id: userId },
      include: { university: true }
    });

    if (!admin) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    res.json({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      university: admin.university
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Update University & Admin Profile
router.put('/profile', authenticate, authorize([Role.UNIVERSITY_ADMIN]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, universityName, domain, description, logoUrl, address, contactEmail, contactPhone } = req.body;

    const admin = await prisma.user.findUnique({ where: { id: userId } });
    if (!admin) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    // Update Admin User Name and Avatar
    if (name || logoUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          name: name || undefined,
          avatarUrl: logoUrl !== undefined ? logoUrl : undefined
        }
      });
    }

    // Update University Details
    let updatedUni = null;
    if (admin.universityId) {
      updatedUni = await prisma.university.update({
        where: { id: admin.universityId },
        data: {
          name: universityName !== undefined ? universityName : undefined,
          domain: domain !== undefined ? domain : undefined,
          description: description !== undefined ? description : undefined,
          logoUrl: logoUrl !== undefined ? logoUrl : undefined,
          address: address !== undefined ? address : undefined,
          contactEmail: contactEmail !== undefined ? contactEmail : undefined,
          contactPhone: contactPhone !== undefined ? contactPhone : undefined
        }
      });
    }

    res.json({
      message: 'University profile updated successfully',
      user: { id: admin.id, name: name || admin.name, email: admin.email },
      university: updatedUni
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
