const express = require("express");

const boardController = require("../controllers/board-controller");

const router = express.Router();

router.get("/", boardController.getBoards);

router.get("/:boardId", boardController.getBoardById);

router.post("/create-board", boardController.createBoard);

router.get("/tasks/:taskId", boardController.getTaskById);

router.post("/add-task/:boardId", boardController.addNewTask);

router.patch("/update-task/:taskId", boardController.updateTask);

router.delete("/delete-task/:taskId", boardController.deleteTask);

module.exports = router;
