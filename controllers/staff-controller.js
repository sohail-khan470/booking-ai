const { staffService } = require("../services");

class StaffController {
  // Create a new staff member
  async createStaff(req, res) {
    try {
      const staff = await staffService.createStaff(req.body);
      res.status(201).json({
        success: true,
        data: staff,
        message: "Staff member created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all staff members
  async getAllStaff(req, res) {
    try {
      const staff = await staffService.getAllStaff();
      res.status(200).json({
        success: true,
        data: staff,
        count: staff.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get staff by ID
  async getStaffById(req, res) {
    try {
      const { id } = req.params;
      const staff = await staffService.getStaffById(id);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        });
      }

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update staff
  async updateStaff(req, res) {
    try {
      const { id } = req.params;
      const staff = await staffService.updateStaff(id, req.body);

      res.status(200).json({
        success: true,
        data: staff,
        message: "Staff member updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete staff
  async deleteStaff(req, res) {
    try {
      const { id } = req.params;
      await staffService.deleteStaff(id);

      res.status(200).json({
        success: true,
        message: "Staff member deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Add staff schedule
  async addStaffSchedule(req, res) {
    try {
      const { id } = req.params;
      const schedule = await staffService.addStaffSchedule(id, req.body);

      res.status(201).json({
        success: true,
        data: schedule,
        message: "Staff schedule added successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get staff schedules
  async getStaffSchedules(req, res) {
    try {
      const { id } = req.params;
      const schedules = await staffService.getStaffSchedules(id);

      res.status(200).json({
        success: true,
        data: schedules,
        count: schedules.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new StaffController();
