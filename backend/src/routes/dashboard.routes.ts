import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (role === Role.STUDENT) {
      const student = await prisma.studentProfile.findUnique({ where: { userId } });
      if (!student) {
        res.json({
          stats: [
            { label: 'Applications Sent', value: 0 },
            { label: 'Under Review', value: 0 },
            { label: 'Offers / Approved', value: 0 }
          ],
          recent: []
        });
        return;
      }

      const [totalApplied, underReview, offers, recent] = await Promise.all([
        prisma.application.count({ where: { studentId: student.id } }),
        prisma.application.count({
          where: { studentId: student.id, status: { in: ['PENDING', 'REVIEWING'] } }
        }),
        prisma.application.count({
          where: { studentId: student.id, status: { in: ['ACCEPTED', 'APPROVED_BY_UNIVERSITY'] } }
        }),
        prisma.application.findMany({
          where: { studentId: student.id },
          include: {
            jobPost: {
              include: {
                company: { select: { companyName: true, logoUrl: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      res.json({
        stats: [
          { label: 'Applications Sent', value: totalApplied },
          { label: 'Under Review', value: underReview },
          { label: 'Offers / Approved', value: offers }
        ],
        recent
      });
      return;
    }

    if (role === Role.COMPANY_HR) {
      const company = await prisma.companyProfile.findUnique({ where: { userId } });
      if (!company) {
        res.json({
          stats: [
            { label: 'Active Jobs', value: 0 },
            { label: 'Total Applicants', value: 0 },
            { label: 'Accepted Candidates', value: 0 }
          ],
          recent: []
        });
        return;
      }

      const [activeJobs, totalApplicants, acceptedCount, recent] = await Promise.all([
        prisma.jobPost.count({ where: { companyProfileId: company.id, isActive: true } }),
        prisma.application.count({ where: { jobPost: { companyProfileId: company.id } } }),
        prisma.application.count({
          where: {
            jobPost: { companyProfileId: company.id },
            status: { in: ['ACCEPTED', 'APPROVED_BY_UNIVERSITY'] }
          }
        }),
        prisma.application.findMany({
          where: { jobPost: { companyProfileId: company.id } },
          include: {
            jobPost: { select: { title: true } },
            student: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      res.json({
        stats: [
          { label: 'Active Jobs', value: activeJobs },
          { label: 'Total Applicants', value: totalApplicants },
          { label: 'Accepted Candidates', value: acceptedCount }
        ],
        recent
      });
      return;
    }

    if (role === Role.UNIVERSITY_ADMIN) {
      const admin = await prisma.user.findUnique({ where: { id: userId } });
      if (!admin || !admin.universityId) {
        res.json({
          stats: [
            { label: 'Total Students', value: 0 },
            { label: 'Placed Students', value: 0 },
            { label: 'Pending Approvals', value: 0 }
          ],
          recent: []
        });
        return;
      }

      const [totalStudents, placedStudents, pendingApprovals, recent] = await Promise.all([
        prisma.studentProfile.count({ where: { universityId: admin.universityId } }),
        prisma.application.count({
          where: {
            student: { universityId: admin.universityId },
            status: 'APPROVED_BY_UNIVERSITY'
          }
        }),
        prisma.application.count({
          where: {
            student: { universityId: admin.universityId },
            status: 'ACCEPTED'
          }
        }),
        prisma.application.findMany({
          where: { student: { universityId: admin.universityId } },
          include: {
            jobPost: {
              include: {
                company: { select: { companyName: true } }
              }
            },
            student: {
              include: {
                user: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      res.json({
        stats: [
          { label: 'Total Students', value: totalStudents },
          { label: 'Placed Students', value: placedStudents },
          { label: 'Pending Approvals', value: pendingApprovals }
        ],
        recent
      });
      return;
    }

    res.status(400).json({ error: 'Unknown role' });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
