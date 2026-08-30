import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/profile/student/:id - Public student profile (supports studentProfile.id or user.id)
router.get('/student/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const callerRole = req.user?.role;

    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        university: { select: { id: true, name: true, logoUrl: true } },
      }
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    // Role-based privacy: GPA is only visible to HR and University Admins
    const isAuthorizedForSensitiveData = callerRole === Role.COMPANY_HR || callerRole === Role.UNIVERSITY_ADMIN;

    res.json({
      id: student.id,
      userId: student.userId,
      name: student.user.name,
      email: student.user.email,
      avatarUrl: student.avatarUrl || student.user.avatarUrl || null,
      studentId: isAuthorizedForSensitiveData ? student.studentId : undefined,
      faculty: student.faculty,
      major: student.major,
      year: student.year,
      gpa: isAuthorizedForSensitiveData ? student.gpa : undefined,
      skills: student.skills,
      bio: student.bio,
      university: student.university
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

// GET /api/profile/company/:id - Public company profile (supports companyProfile.id or user.id)
router.get('/company/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const company = await prisma.companyProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        jobPosts: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            location: true,
            isRemote: true,
            positions: true,
            allowance: true,
            workingHours: true,
            contactEmail: true,
            contactPhone: true,
            contactLine: true,
            applicationLink: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!company) {
      res.status(404).json({ error: 'Company profile not found.' });
      return;
    }

    res.json({
      id: company.id,
      userId: company.userId,
      companyName: company.companyName,
      industry: company.industry,
      website: company.website,
      description: company.description,
      logoUrl: company.logoUrl || company.user.avatarUrl || null,
      address: company.address,
      contactEmail: company.contactEmail || company.user.email,
      contactPhone: company.contactPhone,
      hrRepresentative: company.user.name,
      activeJobs: company.jobPosts
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile.' });
  }
});

// GET /api/profile/university/:id - Public university profile
router.get('/university/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!university) {
      res.status(404).json({ error: 'University profile not found.' });
      return;
    }

    res.json({
      id: university.id,
      name: university.name,
      domain: university.domain,
      description: university.description,
      logoUrl: university.logoUrl,
      address: university.address,
      contactEmail: university.contactEmail,
      contactPhone: university.contactPhone,
      totalStudents: university._count.students
    });
  } catch (error) {
    console.error('Error fetching university profile:', error);
    res.status(500).json({ error: 'Failed to fetch university profile.' });
  }
});

export default router;
