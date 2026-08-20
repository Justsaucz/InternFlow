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
// GET all active jobs (For students to search)
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const jobs = await prisma_1.default.jobPost.findMany({
            where: { isActive: true },
            include: {
                company: {
                    select: { companyName: true, logoUrl: true, address: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST a new job (For Company HR)
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.COMPANY_HR]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, description, requirements, location, isRemote, positions, allowance } = req.body;
        const companyProfile = await prisma_1.default.companyProfile.findUnique({ where: { userId } });
        if (!companyProfile) {
            res.status(404).json({ error: 'Company profile not found' });
            return;
        }
        const newJob = await prisma_1.default.jobPost.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET jobs posted by the logged-in company
router.get('/company', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.COMPANY_HR]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const companyProfile = await prisma_1.default.companyProfile.findUnique({ where: { userId } });
        if (!companyProfile) {
            res.status(404).json({ error: 'Company profile not found' });
            return;
        }
        const jobs = await prisma_1.default.jobPost.findMany({
            where: { companyProfileId: companyProfile.id },
            include: {
                _count: { select: { applications: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=jobs.routes.js.map