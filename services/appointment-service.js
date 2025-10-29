const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AppointmentService {
  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      const appointment = await prisma.appointment.create({
        data: appointmentData,
        include: {
          customer: true,
          service: true,
          staff: true,
        },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }
  }

  // Get all appointments
  async getAllAppointments() {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          customer: true,
          service: true,
          staff: true,
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
      return appointments;
    } catch (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { appointmentId: parseInt(appointmentId) },
        include: {
          customer: true,
          service: true,
          staff: true,
        },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Error fetching appointment: ${error.message}`);
    }
  }

  // Update appointment
  async updateAppointment(appointmentId, updateData) {
    try {
      const appointment = await prisma.appointment.update({
        where: { appointmentId: parseInt(appointmentId) },
        data: updateData,
        include: {
          customer: true,
          service: true,
          staff: true,
        },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Error updating appointment: ${error.message}`);
    }
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      const appointment = await prisma.appointment.delete({
        where: { appointmentId: parseInt(appointmentId) },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }

  // Get appointments by customer
  async getAppointmentsByCustomer(customerId) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { customerId: parseInt(customerId) },
        include: {
          service: true,
          staff: true,
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
      return appointments;
    } catch (error) {
      throw new Error(`Error fetching customer appointments: ${error.message}`);
    }
  }

  // Get appointments by staff
  async getAppointmentsByStaff(staffId) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { staffId: parseInt(staffId) },
        include: {
          customer: true,
          service: true,
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });
      return appointments;
    } catch (error) {
      throw new Error(`Error fetching staff appointments: ${error.message}`);
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      const appointment = await prisma.appointment.update({
        where: { appointmentId: parseInt(appointmentId) },
        data: { status: status },
        include: {
          customer: true,
          service: true,
          staff: true,
        },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Error updating appointment status: ${error.message}`);
    }
  }
}

module.exports = new AppointmentService();
