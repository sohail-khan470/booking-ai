const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class StaffService {
  async createStaff(staffData) {
    try {
      const staff = await prisma.staff.create({
        data: staffData,
      });
      return staff;
    } catch (error) {
      throw new Error(`Error creating staff: ${error.message}`);
    }
  }

  async getAllStaff() {
    try {
      const staff = await prisma.staff.findMany({
        include: {
          schedules: true,
          appointments: true,
          slots: true,
        },
      });
      return staff;
    } catch (error) {
      throw new Error(`Error fetching staff: ${error.message}`);
    }
  }

  // Get staff by ID
  async getStaffById(staffId) {
    try {
      const staff = await prisma.staff.findUnique({
        where: { staffId: parseInt(staffId) },
        include: {
          schedules: true,
          appointments: {
            include: {
              customer: true,
              service: true,
            },
          },
          slots: true,
        },
      });
      return staff;
    } catch (error) {
      throw new Error(`Error fetching staff: ${error.message}`);
    }
  }

  async updateStaff(staffId, updateData) {
    try {
      const staff = await prisma.staff.update({
        where: { staffId: parseInt(staffId) },
        data: updateData,
      });
      return staff;
    } catch (error) {
      throw new Error(`Error updating staff: ${error.message}`);
    }
  }

  async deleteStaff(staffId) {
    try {
      const staff = await prisma.staff.delete({
        where: { staffId: parseInt(staffId) },
      });
      return staff;
    } catch (error) {
      throw new Error(`Error deleting staff: ${error.message}`);
    }
  }

  async addStaffSchedule(staffId, scheduleData) {
    try {
      const schedule = await prisma.staffSchedule.create({
        data: {
          staffId: parseInt(staffId),
          ...scheduleData,
        },
      });
      return schedule;
    } catch (error) {
      throw new Error(`Error adding staff schedule: ${error.message}`);
    }
  }

  async getStaffSchedules(staffId) {
    try {
      const schedules = await prisma.staffSchedule.findMany({
        where: { staffId: parseInt(staffId) },
      });
      return schedules;
    } catch (error) {
      throw new Error(`Error fetching staff schedules: ${error.message}`);
    }
  }
}

module.exports = new StaffService();
