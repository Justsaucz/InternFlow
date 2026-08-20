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
// GET all students in the admin's university
router.get('/students', auth_1.authenticate, (0, auth_1.authorize)([client_1.Role.UNIVERSITY_ADMIN]), async (req, res) => {
    try {
        const userId = req.user?.userId;
        const admin = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!admin || !admin.universityId) {
            res.status(404).json({ error: 'University not associated with this admin' });
            return;
        }
        const students = await prisma_1.default.studentProfile.findMany({
            where: { universityId: admin.universityId },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { user: { name: 'asc' } }
        });
        res.json(students);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map