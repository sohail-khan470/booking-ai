const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CatelogService {
  // Create a new service
  async createService(serviceData) {
    try {
      const service = await prisma.service.create({
        data: serviceData,
      });
      return service;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  // Get all services
  async getAllServices() {
    try {
      const services = await prisma.service.findMany({
        include: {
          appointments: true,
        },
      });
      return services;
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  // Get service by ID
  async getServiceById(serviceId) {
    try {
      const service = await prisma.service.findUnique({
        where: { serviceId: parseInt(serviceId) },
        include: {
          appointments: {
            include: {
              customer: true,
              staff: true,
            },
          },
        },
      });
      return service;
    } catch (error) {
      throw new Error(`Error fetching service: ${error.message}`);
    }
  }

  // Update service
  async updateService(serviceId, updateData) {
    try {
      const service = await prisma.service.update({
        where: { serviceId: parseInt(serviceId) },
        data: updateData,
      });
      return service;
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  // Delete service
  async deleteService(serviceId) {
    try {
      const service = await prisma.service.delete({
        where: { serviceId: parseInt(serviceId) },
      });
      return service;
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  // Get services by duration range
  async getServicesByDuration(minDuration, maxDuration) {
    try {
      const services = await prisma.service.findMany({
        where: {
          duration: {
            gte: minDuration,
            lte: maxDuration,
          },
        },
      });
      return services;
    } catch (error) {
      throw new Error(`Error fetching services by duration: ${error.message}`);
    }
  }
}

module.exports = new CatelogService();
