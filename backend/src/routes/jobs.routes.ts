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
          select: { id: true, companyName: true, logoUrl: true, address: true, industry: true, website: true }
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

// GET jobs posted by the logged-in company (MUST be before /:id to avoid route conflict)
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

// GET single job details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        company: {
          select: { companyName: true, logoUrl: true, address: true, industry: true, website: true, description: true }
        }
      }
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new job (For Company HR)
router.post('/', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { 
      title, 
      description, 
      requirements, 
      location, 
      isRemote, 
      positions, 
      allowance,
      workingHours,
      contactEmail,
      contactPhone,
      contactLine,
      applicationLink,
      isActive 
    } = req.body;

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
        requirements: requirements || '',
        location,
        isRemote: isRemote ?? false,
        positions: parseInt(positions) || 1,
        allowance: allowance || null,
        workingHours: workingHours || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactLine: contactLine || null,
        applicationLink: applicationLink || null,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update an existing job (For Company HR)
router.put('/:id', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { 
      title, 
      description, 
      requirements, 
      location, 
      isRemote, 
      positions, 
      allowance,
      workingHours,
      contactEmail,
      contactPhone,
      contactLine,
      applicationLink,
      isActive 
    } = req.body;

    const companyProfile = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const existingJob = await prisma.jobPost.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (existingJob.companyProfileId !== companyProfile.id) {
      res.status(403).json({ error: 'Unauthorized to edit this job' });
      return;
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id },
      data: {
        title,
        description,
        requirements: requirements || '',
        location,
        isRemote: isRemote ?? existingJob.isRemote,
        positions: positions ? parseInt(positions) : existingJob.positions,
        allowance: allowance !== undefined ? allowance : existingJob.allowance,
        workingHours: workingHours !== undefined ? workingHours : existingJob.workingHours,
        contactEmail: contactEmail !== undefined ? contactEmail : existingJob.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : existingJob.contactPhone,
        contactLine: contactLine !== undefined ? contactLine : existingJob.contactLine,
        applicationLink: applicationLink !== undefined ? applicationLink : existingJob.applicationLink,
        isActive: isActive !== undefined ? isActive : existingJob.isActive,
      }
    });

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a job (For Company HR with safe cascade cleanup)
router.delete('/:id', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    const companyProfile = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
      return;
    }

    const existingJob = await prisma.jobPost.findUnique({ where: { id } });
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (existingJob.companyProfileId !== companyProfile.id) {
      res.status(403).json({ error: 'Unauthorized to delete this job' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find all applications for this job
      const applications = await tx.application.findMany({
        where: { jobPostId: id },
        select: { id: true }
      });
      const appIds = applications.map(a => a.id);

      if (appIds.length > 0) {
        // Unbind or cleanup evaluations for these applications
        await tx.internshipEvaluation.deleteMany({
          where: { applicationId: { in: appIds } }
        });

        // Unlink weekly logs from these applications (preserve student log history)
        await tx.weeklyLog.updateMany({
          where: { applicationId: { in: appIds } },
          data: { applicationId: null }
        });

        // Delete documents linked to these applications
        await tx.document.deleteMany({
          where: { applicationId: { in: appIds } }
        });

        // Delete the applications
        await tx.application.deleteMany({
          where: { id: { in: appIds } }
        });
      }

      // 2. Finally delete the job post
      await tx.jobPost.delete({ where: { id } });
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job post:', error);
    res.status(500).json({ error: 'Failed to delete job post.' });
  }
});

export default router;
