import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET all active jobs (For students to search)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.jobPost.findMany({
      where: { isActive: true },
      include: {
        company: {
          select: { companyName: true, logoUrl: true, address: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new job (For Company HR)
router.post('/', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, description, requirements, location, isRemote, positions, allowance } = req.body;

    const companyProfile = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const newJob = await prisma.jobPost.create({
      data: {
        companyProfileId: companyProfile.id,
        title,
        description,
        requirements,
        location,
        isRemote: isRemote || false,
        positions: parseInt(positions) || 1,
        allowance,
      }
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET jobs posted by the logged-in company
router.get('/company', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const companyProfile = await prisma.companyProfile.findUnique({ where: { userId } });
    
    if (!companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const jobs = await prisma.jobPost.findMany({
      where: { companyProfileId: companyProfile.id },
      include: {
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
