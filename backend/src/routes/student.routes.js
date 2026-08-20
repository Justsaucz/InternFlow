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
// GET Student Profile
router.get('/profile', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.STUDENT]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const profile = await prisma_1.default.studentProfile.findUnique({
            where: { userId },
            include: {
                user: { select: { name: true, email: true } },
                university: { select: { name: true } }
            }
        });
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        res.json(profile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT Student Profile
router.put('/profile', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.STUDENT]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { studentId, major, faculty, year, gpa, bio, skills } = req.body;
        const profile = await prisma_1.default.studentProfile.update({
            where: { userId },
            data: {
                studentId,
                major,
                faculty,
                year,
                gpa,
                bio,
                skills
            }
        });
        res.json(profile);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=student.routes.js.map