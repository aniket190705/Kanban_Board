const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:5173", // ✅ Frontend URL
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
    },
});

// 🔌 MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1);
    });

// 🔧 Middleware
app.use(cors({
    origin: "http://localhost:5173", // 🔐 Restrict to frontend origin
    credentials: true,
}));
app.use(express.json());

// ⚙ Attach io instance to app so it can be used in controllers
app.set("io", io);

// 🛣 Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/boards", require("./routes/boardRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));

// 🔁 Socket.IO events
io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // User joins a board room
    socket.on("joinBoard", (boardId) => {
        socket.join(boardId);
        console.log(`📥 Socket ${socket.id} joined board ${boardId}`);
    });

    // Task created
    socket.on("taskCreated", (task) => {
        io.to(task.boardId).emit("taskCreated", task);
    });

    // Task updated
    socket.on("taskUpdated", (task) => {
        io.to(task.boardId).emit("taskUpdated", task);
    });

    // Task deleted
    socket.on("taskDeleted", (taskId, boardId) => {
        io.to(boardId).emit("taskDeleted", { taskId });
    });

    // Tasks reordered
    socket.on("tasksReordered", ({ boardId, column, tasks }) => {
        console.log(`➡ Reorder on board ${boardId}, column ${column}`);
        io.to(boardId).emit("tasksReordered", { column, tasks });
    });
});

// ❗ 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "❌ Route not found" });
});

// ❗ Error handler
app.use((err, req, res, next) => {
    console.error("🔥 Unhandled error:", err.stack);
    res.status(500).json({ message: "Something broke!", error: err.message });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
