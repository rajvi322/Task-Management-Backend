const Space = require("../models/space");
const Group = require("../models/group");
const Task = require("../models/tasks");
const tasks = require("../models/tasks");

exports.createTask = async (req, res) => {
  try {
    const { space, group, name, priority, description, assignedTo, dueDate } =
      req.body;

    const spaceFound = await Space.findById(space);
    const groupFound = await Group.findOne({ _id: group, space });

    if (!spaceFound) {
      return res.status(404).json({
        message: "Space not found with given Id",
        status: 0,
      });
    }

    if (!groupFound) {
      return res.status(404).json({
        message: "Group not found with given Id or Space",
        status: 0,
      });
    }

    const taskWithSameName = await Task.findOne({
      name,
      space,
    });

    if (taskWithSameName) {
      return res.status(409).json({
        message: "Task with the same name already exists in this space",
        status: 0,
      });
    }

    const newTask = new Task({
      name: name,
      space: space,
      group: group,
      priority: priority || "medium",
      description: description || "",
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
    });

    await newTask.save();

    return res.status(200).json({
      message: "Task added successfuly!",
      status: 0,
      data: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.getAllTaskBySpace = async (req, res) => {
  try {
    const { spaceId } = req.body;
    const spaceFound = await Space.findById(spaceId);

    if (!spaceFound) {
      return res.status(404).json({
        message: "Space not found with given id",
        status: 0,
      });
    }

    const groupsInSpace = await Group.find({ space: spaceId });

    if (!groupsInSpace.length) {
      return res.status(404).json({
        message: "No groups found for the given space",
        status: 0,
      });
    }

    const groupIds = groupsInSpace.map((group) => group._id);

    const tasks = await Task.find({ group: { $in: groupIds } });

    console.log(tasks, "groupinspaceee===>>>");
    return res.status(200).json({
      message: "Tasks fetched successfully!",
      status: 1,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.changeTaskGroup = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newGpId } = req.body;

    const taskExist = await Task.findById(taskId);

    if (!taskExist) {
      return res.status(404).json({
        message: "Task not found",
        status: 0,
      });
    }

    if (taskExist.group.toString() === newGpId) {
      return res.status(400).json({
        message: "Task is already in the selected group",
        status: 1,
      });
    }

    taskExist.group = newGpId;
    await taskExist.save();

    return res.status(200).json({
      message: "Task group updated successfully",
      status: 1,
      task: taskExist,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.updateTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    // const { name, priority, space, group, description, assignedTo, dueDate } =
    //   req.body;

    // const taskFound = await Task.findById(taskId);

    // can be done by this also. more optimal
    const updateFields = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found with given ID",
        status: 0,
      });
    }

    // console.log(taskFound, "taskfound////==>>>>>");

    // if (!taskFound) {
    //   return res.status(404).json({
    //     message: "Task not found with given Id",
    //     status: 0,
    //   });
    // }

    // if (name) {
    //   taskFound.name = name;
    // }
    // if (priority) {
    //   taskFound.priority = priority;
    // }
    // if (space) {
    //   taskFound.space = space;
    // }
    // if (group) {
    //   taskFound.group = group;
    // }
    // if (description) {
    //   taskFound.description = description;
    // }
    // if (assignedTo) {
    //   taskFound.assignedTo = assignedTo;
    // }
    // if (dueDate) {
    //   taskFound.dueDate = dueDate;
    // }

    // await taskFound.save();

    return res.status(200).json({
      message: "Task updated successfully",
      status: 1,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found with given ID",
        status: 0,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params; // 1️⃣ Fixed `req.paras` -> `req.params`

    const deletedTask = await Task.findByIdAndDelete(taskId); // 2️⃣ Fixed incorrect model & query

    if (!deletedTask) {
      // 3️⃣ Fixed `updatedTask` -> `deletedTask`
      return res.status(404).json({
        message: "Task not found with given ID",
        status: 0,
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
      status: 1,
      deletedTask, // 4️⃣ Sending back the deleted task
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};
