const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff-controller");

router.post("/", staffController.createStaff);

router.get("/", staffController.getAllStaff);

router.get("/:id", staffController.getStaffById);

router.put("/:id", staffController.updateStaff);

router.delete("/:id", staffController.deleteStaff);

router.post("/:id/schedules", staffController.addStaffSchedule);

router.get("/:id/schedules", staffController.getStaffSchedules);

module.exports = router;
