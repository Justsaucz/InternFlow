"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId || !role) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (role === client_1.Role.STUDENT) {
            const student = await prisma_1.default.studentProfile.findUnique({ where: { userId } });
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
                prisma_1.default.application.count({ where: { studentId: student.id } }),
                prisma_1.default.application.count({
                    where: { studentId: student.id, status: { in: ['PENDING', 'REVIEWING'] } }
                }),
                prisma_1.default.application.count({
                    where: { studentId: student.id, status: { in: ['ACCEPTED', 'APPROVED_BY_UNIVERSITY'] } }
                }),
                prisma_1.default.application.findMany({
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
        if (role === client_1.Role.COMPANY_HR) {
            const company = await prisma_1.default.companyProfile.findUnique({ where: { userId } });
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
                prisma_1.default.jobPost.count({ where: { companyProfileId: company.id, isActive: true } }),
                prisma_1.default.application.count({ where: { jobPost: { companyProfileId: company.id } } }),
                prisma_1.default.application.count({
                    where: {
                        jobPost: { companyProfileId: company.id },
                        status: { in: ['ACCEPTED', 'APPROVED_BY_UNIVERSITY'] }
                    }
                }),
                prisma_1.default.application.findMany({
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
        if (role === client_1.Role.UNIVERSITY_ADMIN) {
            const admin = await prisma_1.default.user.findUnique({ where: { id: userId } });
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
                prisma_1.default.studentProfile.count({ where: { universityId: admin.universityId } }),
                prisma_1.default.application.count({
                    where: {
                        student: { universityId: admin.universityId },
                        status: 'APPROVED_BY_UNIVERSITY'
                    }
                }),
                prisma_1.default.application.count({
                    where: {
                        student: { universityId: admin.universityId },
                        status: 'ACCEPTED'
                    }
                }),
                prisma_1.default.application.findMany({
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
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map