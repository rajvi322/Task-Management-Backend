const express = require("express");
const verifyToken = require("../middlewares/auth");
const GroupController = require("../controller/Group");

const router = express.Router();

router.post("/add-group", verifyToken, GroupController.addGroup);
router.delete(
  "/delete-group/:groupId",
  verifyToken,
  GroupController.deleteGroup
);
router.put("/update-group/:groupId", verifyToken, GroupController.updateGroup);
router.get("/get-groups/:spaceId", verifyToken, GroupController.listGroups);

module.exports = router;
