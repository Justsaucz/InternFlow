import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET Company Profile
router.get('/profile', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyProfile: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Auto-create company profile if missing
    if (!user.companyProfile) {
      const newCompanyProfile = await prisma.companyProfile.create({
        data: {
          userId,
          companyName: user.name ? `${user.name}'s Company` : 'My Company',
          industry: '',
          website: '',
          description: '',
          address: '',
          contactEmail: user.email,
        }
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        profile: newCompanyProfile
      });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile: user.companyProfile
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Update Company Profile
router.put('/profile', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { 
      name, 
      companyName, 
      industry, 
      website, 
      description, 
      logoUrl, 
      address, 
      contactEmail, 
      contactPhone 
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update HR user name and avatar
    if (name || logoUrl !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          name: name || undefined,
          avatarUrl: logoUrl !== undefined ? logoUrl : undefined
        }
      });
    }

    // Upsert Company Profile
    const updatedProfile = await prisma.companyProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: companyName || user.name || 'My Company',
        industry: industry || '',
        website: website || '',
        description: description || '',
        logoUrl: logoUrl || null,
        address: address || '',
        contactEmail: contactEmail || user.email,
        contactPhone: contactPhone || '',
      },
      update: {
        companyName: companyName !== undefined ? companyName : undefined,
        industry: industry !== undefined ? industry : undefined,
        website: website !== undefined ? website : undefined,
        description: description !== undefined ? description : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        address: address !== undefined ? address : undefined,
        contactEmail: contactEmail !== undefined ? contactEmail : undefined,
        contactPhone: contactPhone !== undefined ? contactPhone : undefined,
      }
    });

    res.json({
      message: 'Company profile updated successfully',
      user: { id: user.id, name: name || user.name, email: user.email },
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
