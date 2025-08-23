const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
    },
    action: String,
    details: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model("Activity", activitySchema);
