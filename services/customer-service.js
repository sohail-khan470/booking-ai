const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CustomerService {
  // Create a new customer
  async createCustomer(customerData) {
    try {
      const customer = await prisma.customer.create({
        data: customerData,
      });
      return customer;
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  // Get all customers
  async getAllCustomers() {
    console.log("@A::Console");

    try {
      const customers = await prisma.customer.findMany({
        include: {
          appointments: true,
        },
      });
      return customers;
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  // Get customer by ID
  async getCustomerById(customerId) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { customerId: parseInt(customerId) },
        include: {
          appointments: {
            include: {
              service: true,
              staff: true,
            },
          },
        },
      });
      return customer;
    } catch (error) {
      throw new Error(`Error fetching customer: ${error.message}`);
    }
  }

  // Update customer
  async updateCustomer(customerId, updateData) {
    try {
      const customer = await prisma.customer.update({
        where: { customerId: parseInt(customerId) },
        data: updateData,
      });
      return customer;
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const customer = await prisma.customer.delete({
        where: { customerId: parseInt(customerId) },
      });
      return customer;
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  // Find customer by email or phone
  async findCustomerByEmailOrPhone(email, phoneNumber) {
    try {
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [{ email: email }, { phoneNumber: phoneNumber }],
        },
      });
      return customer;
    } catch (error) {
      throw new Error(`Error finding customer: ${error.message}`);
    }
  }
}

module.exports = new CustomerService();
