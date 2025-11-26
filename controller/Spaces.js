const Spaces = require("../models/space");

exports.createSpace = async (req, res) => {
  try {
    const dataFound = await Spaces.findOne({ name: req.body.name });
    if (dataFound) {
      return res.status(409).json({
        message: "Space already exists",
        status: 0,
      });
    }
    const newSpace = new Spaces({
      name: req.body.name.trim(),
      groups: req.body.groups,
      description: req.body.description.trim(),
      tasks: req.body.tasks,
    });
    await newSpace.save();
    return res.status(201).json({
      message: "Space created successfully",
      status: 1,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      status: 0,
    });
  }
};

exports.deleteSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const dataFound = await Spaces.findOne({ _id: id });

    if (!dataFound) {
      return res.status(404).json({
        message: "Space not found",
        status: 0,
      });
    }

    await Spaces.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Space deleted successfully",
      status: 1,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      status: 0,
    });
  }
};

exports.updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    const dataFound = await Spaces.findOne({ _id: id });
    if (!dataFound) {
      return res.status(404).json({
        message: "Space not found",
        status: 1,
      });
    }
    if (req.body.name !== undefined) {
      if (req.body.name !== dataFound.name) {
        const customerWithSameName = await Spaces.findOne({
          name: req.body.name,
        });
        if (
          customerWithSameName &&
          customerWithSameName._id.toString() !== id
        ) {
          return res.status(400).json({
            message: "Name is already taken",
            status: 0,
          });
        }
      }
    }
    const updatedData = await Spaces.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Data updated successfully",
      status: 1,
      data: updatedData,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      status: 0,
    });
  }
};

exports.findSpaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const dataFound = await Spaces.findById(id);
    if (!dataFound) {
      return res.status(404).json({
        message: "Data not found",
        status: 0,
      });
    }

    return res.status(200).json({
      message: "Data found",
      status: 1,
      data: dataFound,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
      status: 0,
    });
  }
};

exports.listSpaces = async (req, res) => {
  try {
    const allSpaces = await Spaces.find();
    if (!allSpaces) {
      return res.status(404).json({
        message: "Data not found",
        status: 0,
      });
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      status: 1,
      data: allSpaces,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
      status: 0,
    });
  }
};
