const Activity = require("../models/Activity");

const logActivity = async ({ user, boardId, action, details, io }) => {
    try {
        const activity = await Activity.create({
            user: user.id, // ✅ must be ObjectId
            boardId,
            action,
            details,
        });

        console.log("Logging activity with data:", { user, boardId, action, details });


        if (io) {
            const populated = await Activity.findById(activity._id)
                .populate("user", "name")
                .lean();

            io.to(boardId.toString()).emit("activityLogged", populated);
        }
    } catch (err) {
        console.log("❌ Failed to log activity:", err);
    }
};

module.exports = logActivity;
