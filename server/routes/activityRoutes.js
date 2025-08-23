const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity"); // your activity model
const requireAuth = require("../middleware/verifyToken"); // if you have auth middleware

// GET /api/activity?boardId=xyz
router.get("/", requireAuth, async (req, res) => {
    const { boardId } = req.query;

    if (!boardId) {
        return res.status(400).json({ message: "boardId is required" });
    }

    try {
        const activities = await Activity.find({ boardId })
            .sort({ timestamp: -1 })
            .limit(20)
            .populate("user", "name");

        res.json(activities);
    } catch (err) {
        console.error("❌ Failed to fetch activities:", err);
        res.status(500).json({ message: "Failed to fetch activities", error: err.message });
    }
});

module.exports = router;
