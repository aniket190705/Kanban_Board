const Task = require("../models/Task");
const logActivity = require("../utils/logActivity");


exports.getAllTasks = async (req, res) => {
    try {
        const { boardId } = req.query;

        if (!boardId) {
            return res.status(400).json({ message: "Missing boardId" });
        }

        let tasks = await Task.find({ boardId }).sort({ order: 1 });




        res.status(200).json(tasks);
    } catch (err) {
        console.error("❌ Error in getAllTasks:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


exports.createTask = async (req, res) => {
    try {

        const { title, description, priority, status, boardId } = req.body;
        console.log("user: ", req.user)
        if (!boardId || !title || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            status,
            boardId,
            createdBy: req.user.id,
        });
        await logActivity({
            user: req.user,
            boardId: task.boardId,
            action: "Created Task",
            details: task.title,
            io: req.app.get("io")
        });

        const io = req.app.get("io");
        io.to(boardId).emit("taskCreated", task);

        res.status(201).json(task);
    } catch (err) {
        console.error("❌ Error creating task:", err);
        res.status(400).json({ message: "Error creating task", error: err.message });
    }
};


exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        console.log("req.data", req.data)
        const activity = await logActivity({
            user: req.user,
            boardId: task.boardId,
            action: "Updated Task",
            details: task.title,
            io: req.app.get("io")
        });

        const io = req.app.get("io");
        io.emit("taskUpdated", task); // Optional: task updates
        io.to(task.boardId).emit("activityLogged", activity);

        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Error updating task", error: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Task ID is required" });

    try {
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // ✅ Log activity
        const activity = await logActivity({
            user: req.user,
            boardId: deletedTask.boardId,
            action: "Deleted Task",
            details: deletedTask.title,
            io: req.app.get("io")
        });
        console.log("deleted task:", deletedTask);
        console.log("activity:", activity);
        // ✅ Emit via socket
        const io = req.app.get("io");
        io.to(deletedTask.boardId).emit("activityLogged", activity);
        io.emit("taskDeleted", { taskId: deletedTask._id });
        res.json({ message: "Task deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete task", error: err.message });
    }
};


exports.reorderTasks = async (req, res) => {
    const { boardId, tasks, column } = req.body;

    if (!boardId || !tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ message: "Invalid reorder request" });
    }

    try {
        const bulkOps = tasks.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id, boardId },
                update: { $set: { order } },
            },
        }));

        await Task.bulkWrite(bulkOps); // ✅ much faster than multiple findByIdAndUpdate
        const activity = await logActivity({
            user: req.user,
            boardId,
            action: "Reordered Tasks",
            details: `rearranged the tasks in ${column} column`,
            io: req.app.get("io"),
        });
        const io = req.app.get("io");
        io.to(boardId).emit("activityLogged", activity);
        res.status(200).json({ message: "Task order updated" });
    } catch (err) {
        console.error("Reorder error:", err);
        res.status(500).json({ message: "Reorder failed", error: err.message });
    }
};

