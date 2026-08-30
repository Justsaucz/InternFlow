import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, universityId } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name,
        role: role as Role,
        universityId: universityId || null,
      },
    });

    // Create profile based on role
    if (role === Role.STUDENT && universityId) {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          universityId,
          studentId: '', // To be updated by student later
          major: '',
          faculty: '',
          year: 1,
        }
      });
    } else if (role === Role.COMPANY_HR) {
      await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: name, // Default to user name for now
          industry: '',
        }
      });
    }

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim();
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: 'insensitive' }
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
