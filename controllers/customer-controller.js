const customerService = require("../services/customer-service");

class CustomerController {
  // Create a new customer
  async createCustomer(req, res) {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({
        success: true,
        data: customer,
        message: "Customer created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json({
        success: true,
        data: customers,
        count: customers.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(id, req.body);

      res.status(200).json({
        success: true,
        data: customer,
        message: "Customer updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Find customer by email or phone
  async findCustomer(req, res) {
    try {
      const { email, phoneNumber } = req.query;
      const customer = await customerService.findCustomerByEmailOrPhone(
        email,
        phoneNumber
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CustomerController();
