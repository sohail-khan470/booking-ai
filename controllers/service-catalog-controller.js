const { serviceCatelog: businessService } = require("../services");

class ServiceCatelogController {
  // Create a new service
  async createService(req, res) {
    try {
      const service = await businessService.createService(req.body);
      res.status(201).json({
        success: true,
        data: service,
        message: "Service created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all services
  async getAllServices(req, res) {
    try {
      const services = await businessService.getAllServices();
      res.status(200).json({
        success: true,
        data: services,
        count: services.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get service by ID
  async getServiceById(req, res) {
    try {
      const { id } = req.params;
      const service = await businessService.getServiceById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update service
  async updateService(req, res) {
    try {
      const { id } = req.params;
      const service = await businessService.updateService(id, req.body);

      res.status(200).json({
        success: true,
        data: service,
        message: "Service updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete service
  async deleteService(req, res) {
    try {
      const { id } = req.params;
      await businessService.deleteService(id);

      res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get services by duration
  async getServicesByDuration(req, res) {
    try {
      const { minDuration, maxDuration } = req.query;
      const services = await businessService.getServicesByDuration(
        parseInt(minDuration),
        parseInt(maxDuration)
      );

      res.status(200).json({
        success: true,
        data: services,
        count: services.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ServiceCatelogController();
