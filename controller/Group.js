const Group = require("../models/group");
const Space = require("../models/space");

exports.addGroup = async (req, res) => {
  try {
    const { name, color, order, spaceId } = req.body;
    const spaceFound = await Space.findById(spaceId);
    if (!spaceFound) {
      return res.status(404).json({
        message: "The space does not exist",
        status: 0,
      });
    }
    const groupFound = await Group.findOne({
      _id: spaceId,
      name: name,
    });
    if (groupFound) {
      return res.status(409).json({
        message: "The group already exists",
        status: 0,
      });
    } else {
      const newGroup = new Group({
        name: name,
        color: color,
        order: order,
        space: spaceId,
      });
      await newGroup.save();
      res.status(200).json({
        message: "Group added successfully",
        status: 1,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupFound = await Group.findById(groupId);
    if (!groupFound) {
      return res.status(404).json({
        message: "The group does not exist",
        status: 0,
      });
    }

    await Group.deleteOne({ _id: groupId });

    return res.status(404).json({
      message: "Group deleted successfuly",
      status: 0,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
      status: 0,
    });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, order, color } = req.body;
    const groupFound = await Group.findById(groupId);
    if (!groupFound) {
      return res.status(404).json({
        message: "Group not found",
        status: 0,
      });
    }
    if (name) {
      groupFound.name = name;
    }

    if (color) {
      groupFound.color = color;
    }

    if (description) {
      groupFound.description = description;
    }

    if (order) {
      groupFound.order = order;
    }

    await groupFound.save();

    return res.status(200).json({
      message: "group updated successfully",
      status: 1,
      data: groupFound,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.listGroups = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const spaceFound = await Space.findOne({ _id: spaceId });

    if (!spaceFound) {
      return res.status(404).json({
        message: "Space not found!",
        status: 0,
      });
    }

    const groupList = await Group.find({ space: spaceId });

    return res.status(200).json({
      message: "groups retrieved successfully!",
      groups: groupList,
      spaceName: spaceFound.name,
      status: 1,
    });
  } catch (error) {
    return res.status(500).json({
      messsage: error.message,
      status: 0,
    });
  }
};
