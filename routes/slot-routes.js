const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slot-controller");

router.post("/", slotController.createSlot);

router.get("/", slotController.getAllSlots);

router.get("/available", slotController.getAvailableSlots);

router.get("/:id", slotController.getSlotById);

router.put("/:id", slotController.updateSlot);

router.delete("/:id", slotController.deleteSlot);

router.get("/staff/:staffId", slotController.getSlotsByStaff);

router.patch("/:id/book", slotController.bookSlot);

router.patch("/:id/free", slotController.freeSlot);

module.exports = router;
