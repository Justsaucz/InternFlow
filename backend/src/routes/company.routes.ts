import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET Company Profile
router.get('/profile', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyProfile: true
      }
    });

    if (!user || !user.companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Update Company Profile
router.put('/profile', authenticate, authorize([Role.COMPANY_HR]), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
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

    if (!user || !user.companyProfile) {
      res.status(404).json({ error: 'Company profile not found' });
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

    // Update Company Profile
    const updatedProfile = await prisma.companyProfile.update({
      where: { id: user.companyProfile.id },
      data: {
        companyName: companyName !== undefined ? companyName : user.companyProfile.companyName,
        industry: industry !== undefined ? industry : user.companyProfile.industry,
        website: website !== undefined ? website : user.companyProfile.website,
        description: description !== undefined ? description : user.companyProfile.description,
        logoUrl: logoUrl !== undefined ? logoUrl : user.companyProfile.logoUrl,
        address: address !== undefined ? address : user.companyProfile.address,
        contactEmail: contactEmail !== undefined ? contactEmail : user.companyProfile.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : user.companyProfile.contactPhone,
      }
    });

    res.json({
      message: 'Company profile updated successfully',
      user: { id: user.id, name: name || user.name, email: user.email },
      profile: updatedProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
