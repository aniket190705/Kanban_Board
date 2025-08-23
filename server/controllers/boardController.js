const Board = require("../models/Board");
const User = require("../models/User");

exports.createBoard = async (req, res) => {
    const { title } = req.body;

    const board = await Board.create({
        title,
        createdBy: req.user.id,
        members: [req.user.id],
    });

    res.status(201).json(board);
};

exports.getBoards = async (req, res) => {
    const boards = await Board.find({
        members: req.user.id,
    }).populate("members", "name email").populate("createdBy", "name email");

    res.json(boards);
};



exports.inviteToBoard = async (req, res) => {
    try {
        const { id } = req.params; // board ID
        const { email } = req.body;

        const userToInvite = await User.findOne({ email });

        if (!userToInvite) {
            return res.status(404).json({ message: "User not found" });
        }

        const board = await Board.findById(id);

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        // Avoid duplicates
        if (!board.members.includes(userToInvite._id)) {
            board.members.push(userToInvite._id);
            await board.save();
        }

        res.status(200).json({ message: "User invited successfully", board });
    } catch (err) {
        console.error("Error inviting user:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.deleteBoard = async (req, res) => {
    const { id } = req.params;
    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // Only allow the creator to delete the board
    if (String(board.createdBy) !== String(req.user.id)) {
        return res.status(403).json({ message: "You are not allowed to delete this board." });
    }

    await board.deleteOne();
    res.status(204).end(); // No Content
};
