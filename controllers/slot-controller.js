const { slotService } = require("../services");

class SlotController {
  // Create a new slot
  async createSlot(req, res) {
    try {
      const slot = await slotService.createSlot(req.body);
      res.status(201).json({
        success: true,
        data: slot,
        message: "Slot created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all slots
  async getAllSlots(req, res) {
    try {
      const slots = await slotService.getAllSlots();
      res.status(200).json({
        success: true,
        data: slots,
        count: slots.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get slot by ID
  async getSlotById(req, res) {
    try {
      const { id } = req.params;
      const slot = await slotService.getSlotById(id);

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }

      res.status(200).json({
        success: true,
        data: slot,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update slot
  async updateSlot(req, res) {
    try {
      const { id } = req.params;
      const slot = await slotService.updateSlot(id, req.body);

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete slot
  async deleteSlot(req, res) {
    try {
      const { id } = req.params;
      await slotService.deleteSlot(id);

      res.status(200).json({
        success: true,
        message: "Slot deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get slots by staff
  async getSlotsByStaff(req, res) {
    try {
      const { staffId } = req.params;
      const slots = await slotService.getSlotsByStaff(staffId);

      res.status(200).json({
        success: true,
        data: slots,
        count: slots.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get available slots
  async getAvailableSlots(req, res) {
    try {
      const slots = await slotService.getAvailableSlots();
      res.status(200).json({
        success: true,
        data: slots,
        count: slots.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Book a slot
  async bookSlot(req, res) {
    try {
      const { id } = req.params;
      const slot = await slotService.bookSlot(id);

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot booked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Free a slot
  async freeSlot(req, res) {
    try {
      const { id } = req.params;
      const slot = await slotService.freeSlot(id);

      res.status(200).json({
        success: true,
        data: slot,
        message: "Slot freed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SlotController();
