const appointmentService = require("../services/appointment-service");

class AppointmentController {
  // Create a new appointment
  async createAppointment(req, res) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res.status(201).json({
        success: true,
        data: appointment,
        message: "Appointment created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all appointments
  async getAllAppointments(req, res) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get appointment by ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.getAppointmentById(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update appointment
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.updateAppointment(
        id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: appointment,
        message: "Appointment updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete appointment
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      await appointmentService.deleteAppointment(id);

      res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get appointments by customer
  async getAppointmentsByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const appointments = await appointmentService.getAppointmentsByCustomer(
        customerId
      );

      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get appointments by staff
  async getAppointmentsByStaff(req, res) {
    try {
      const { staffId } = req.params;
      const appointments = await appointmentService.getAppointmentsByStaff(
        staffId
      );

      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const appointment = await appointmentService.updateAppointmentStatus(
        id,
        status
      );

      res.status(200).json({
        success: true,
        data: appointment,
        message: "Appointment status updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AppointmentController();
