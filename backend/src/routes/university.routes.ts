import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET - Public list of all universities (for registration dropdown)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const universities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        logoUrl: true,
      },
      orderBy: { name: 'asc' }
    });

    res.json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
