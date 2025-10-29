const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SlotService {
  async createSlot(slotData) {
    try {
      const slot = await prisma.slot.create({
        data: slotData,
      });
      return slot;
    } catch (error) {
      throw new Error(`Error creating slot: ${error.message}`);
    }
  }

  async getAllSlots() {
    try {
      const slots = await prisma.slot.findMany({
        include: {
          staff: true,
        },
      });
      return slots;
    } catch (error) {
      throw new Error(`Error fetching slots: ${error.message}`);
    }
  }

  async getSlotById(slotId) {
    try {
      const slot = await prisma.slot.findUnique({
        where: { slotId: parseInt(slotId) },
        include: {
          staff: true,
        },
      });
      return slot;
    } catch (error) {
      throw new Error(`Error fetching slot: ${error.message}`);
    }
  }

  async updateSlot(slotId, updateData) {
    try {
      const slot = await prisma.slot.update({
        where: { slotId: parseInt(slotId) },
        data: updateData,
      });
      return slot;
    } catch (error) {
      throw new Error(`Error updating slot: ${error.message}`);
    }
  }

  async deleteSlot(slotId) {
    try {
      const slot = await prisma.slot.delete({
        where: { slotId: parseInt(slotId) },
      });
      return slot;
    } catch (error) {
      throw new Error(`Error deleting slot: ${error.message}`);
    }
  }

  async getSlotsByStaff(staffId) {
    try {
      const slots = await prisma.slot.findMany({
        where: { staffId: parseInt(staffId) },
        include: {
          staff: true,
        },
        orderBy: {
          date: "asc",
        },
      });
      return slots;
    } catch (error) {
      throw new Error(`Error fetching staff slots: ${error.message}`);
    }
  }

  async getAvailableSlots() {
    try {
      const slots = await prisma.slot.findMany({
        where: { isBooked: false },
        include: {
          staff: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });
      return slots;
    } catch (error) {
      throw new Error(`Error fetching available slots: ${error.message}`);
    }
  }

  async bookSlot(slotId) {
    try {
      const slot = await prisma.slot.update({
        where: { slotId: parseInt(slotId) },
        data: { isBooked: true },
      });
      return slot;
    } catch (error) {
      throw new Error(`Error booking slot: ${error.message}`);
    }
  }

  async freeSlot(slotId) {
    try {
      const slot = await prisma.slot.update({
        where: { slotId: parseInt(slotId) },
        data: { isBooked: false },
      });
      return slot;
    } catch (error) {
      throw new Error(`Error freeing slot: ${error.message}`);
    }
  }
}

module.exports = new SlotService();
