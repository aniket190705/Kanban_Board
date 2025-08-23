const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks
} = require('../controllers/taskController');

router.get('/', verifyToken, getAllTasks);
router.post('/', verifyToken, createTask);
router.patch('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);
router.post("/reorder", verifyToken, reorderTasks);
module.exports = router;
