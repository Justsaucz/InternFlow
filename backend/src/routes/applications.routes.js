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
// POST - Student applies for a job
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.STUDENT]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { jobPostId, coverLetter, cvUrl } = req.body;
        const student = await prisma_1.default.studentProfile.findUnique({ where: { userId } });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
            return;
        }
        // Check if student already applied to this job
        const existingApplication = await prisma_1.default.application.findFirst({
            where: { studentId: student.id, jobPostId }
        });
        if (existingApplication) {
            res.status(400).json({ error: 'You have already applied to this job.' });
            return;
        }
        // Create Application and Document in a transaction
        const application = await prisma_1.default.$transaction(async (tx) => {
            const app = await tx.application.create({
                data: {
                    jobPostId,
                    studentId: student.id,
                    coverLetter: coverLetter || null,
                }
            });
            if (cvUrl && userId) {
                await tx.document.create({
                    data: {
                        userId: userId, // Assuming Document needs userId (from User model)
                        applicationId: app.id,
                        title: 'Resume/CV',
                        fileUrl: cvUrl,
                        type: 'CV'
                    }
                });
            }
            return app;
        });
        res.status(201).json({ message: 'Application submitted successfully', application });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET - Student views their own applications
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.STUDENT]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const student = await prisma_1.default.studentProfile.findUnique({ where: { userId } });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        const applications = await prisma_1.default.application.findMany({
            where: { studentId: student.id },
            include: {
                jobPost: {
                    include: {
                        company: { select: { companyName: true, logoUrl: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET - Company HR views applicants for their jobs
router.get('/company', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.COMPANY_HR]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const company = await prisma_1.default.companyProfile.findUnique({ where: { userId } });
        if (!company) {
            res.status(404).json({ error: 'Company profile not found' });
            return;
        }
        const applications = await prisma_1.default.application.findMany({
            where: {
                jobPost: { companyProfileId: company.id }
            },
            include: {
                jobPost: { select: { title: true } },
                documents: true,
                student: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH - Company HR updates application status (Accept/Reject)
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.COMPANY_HR]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['REVIEWING', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status. Must be REVIEWING, ACCEPTED, or REJECTED.' });
            return;
        }
        const application = await prisma_1.default.application.update({
            where: { id },
            data: { status }
        });
        res.json(application);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET - University Admin views all applications for their university's students
router.get('/university', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.UNIVERSITY_ADMIN]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const admin = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!admin || !admin.universityId) {
            res.status(404).json({ error: 'University not associated with this admin' });
            return;
        }
        const applications = await prisma_1.default.application.findMany({
            where: {
                student: { universityId: admin.universityId }
            },
            include: {
                jobPost: {
                    include: {
                        company: { select: { companyName: true } }
                    }
                },
                student: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH - University Admin approves an accepted application
router.patch('/:id/approve', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.UNIVERSITY_ADMIN]), async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma_1.default.application.findUnique({ where: { id } });
        if (!application) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }
        if (application.status !== 'ACCEPTED') {
            res.status(400).json({ error: 'Can only approve applications that have been accepted by the company.' });
            return;
        }
        const updated = await prisma_1.default.application.update({
            where: { id },
            data: { status: 'APPROVED_BY_UNIVERSITY' }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=applications.routes.js.map