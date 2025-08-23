const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
    createBoard,
    getBoards,
    inviteToBoard,
} = require("../controllers/boardController");

router.get("/", verifyToken, getBoards);
router.post("/", verifyToken, createBoard);
router.patch("/:id/invite", verifyToken, inviteToBoard);
router.delete("/:id", verifyToken, require("../controllers/boardController").deleteBoard);

module.exports = router;
