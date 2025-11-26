const express = require("express");
const verifyToken = require("../middlewares/auth");
const SpacesController = require("../controller/Spaces");

const router = express.Router();

router.post("/add-space", verifyToken, SpacesController.createSpace);
router.delete("/delete-space/:id", verifyToken, SpacesController.deleteSpace);
router.put("/update-space/:id", verifyToken, SpacesController.updateSpace);
router.get("/get_space_id/:id", verifyToken, SpacesController.findSpaceById);
router.get("/list-space", verifyToken, SpacesController.listSpaces);

module.exports = router;
