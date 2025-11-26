const express = require("express");
const verifyToken = require("../middlewares/auth");
const TaskController = require("../controller/Tasks");
const router = express.Router();

router.post("/add-task", verifyToken, TaskController.createTask);
router.post("/get-tasks", verifyToken, TaskController.getAllTaskBySpace);
router.patch(
  "/change-task-status",
  verifyToken,
  TaskController.changeTaskGroup
);
router.patch(
  "/update-task-details/:taskId",
  verifyToken,
  TaskController.updateTaskDetails
);
router.patch(
  "/delete-stask/:taskId",
  verifyToken,
  TaskController.updateTaskDetails
);

router.delete(
  "/update-task-details/:taskId",
  verifyToken,
  TaskController.deleteTask
);

module.exports = router;
