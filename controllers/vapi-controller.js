const vapiService = require("../services/vapi-service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class VapiController {
  // Your existing methods
  async initiateBookingCall(req, res) {
    try {
      const { phoneNumber, customerName, customerEmail } = req.body;

      const customerData = {
        name: customerName,
        email: customerEmail,
        phoneNumber: phoneNumber,
      };

      const call = await vapiService.createBookingCall(
        phoneNumber,
        customerData
      );

      res.json({
        success: true,
        callId: call.id,
        status: call.status,
        message: "Booking call initiated successfully",
      });
    } catch (error) {
      console.error("Error initiating booking call:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate booking call",
      });
    }
  }

  async getCallStatus(req, res) {
    try {
      const { callId } = req.params;
      const call = await vapiService.getCallDetails(callId);

      res.json({
        success: true,
        call,
      });
    } catch (error) {
      console.error("Error fetching call status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch call status",
      });
    }
  }

  async getCustomerCallHistory(req, res) {
    try {
      const { phoneNumber } = req.params;
      const calls = await vapiService.getCustomerCalls(phoneNumber);

      res.json({
        success: true,
        calls,
      });
    } catch (error) {
      console.error("Error fetching call history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch call history",
      });
    }
  }

  // Enhanced webhook handler with function call support
  async handleWebhook(req, res) {
    console.log("@inside webhook");
    try {
      const { type, call, message, functionCall, conversation, transcript } =
        req.body;

      // Handle different webhook formats (Vapi has multiple webhook types)
      if (type === "function-call") {
        // Handle real-time function execution
        const result = await this.handleFunctionCall(
          functionCall.name,
          functionCall.parameters
        );
        return res.json(result);
      }

      if (type === "conversation-update" && conversation?.status === "ended") {
        // Process completed call
        await vapiService.processCompletedCall(req.body);
        return res.json({ status: "ok" });
      }

      if (type === "call.ended" || type === "call.completed") {
        // Your existing webhook format
        await vapiService.processCompletedCall(call);
      }

      // Acknowledge webhook receipt
      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  // New method: Handle real-time function calls
  async handleFunctionCall(functionName, parameters) {
    try {
      console.log(`Handling function call: ${functionName}`, parameters);

      const functionConfig = vapiFunctions[functionName];
      if (!functionConfig || !functionConfig.handler) {
        throw new Error(`Function ${functionName} not found`);
      }

      const result = await functionConfig.handler(parameters);
      console.log(` Function result:`, result);

      return result;
    } catch (error) {
      console.error(` Function error:`, error);
      return {
        success: false,
        message: `Error executing ${functionName}: ${error.message}`,
      };
    }
  }

  // New method: Get available services
  async getServices(req, res) {
    try {
      const services = await prisma.service.findMany({
        select: {
          serviceId: true,
          serviceName: true,
          description: true,
          duration: true,
          price: true,
        },
        orderBy: { serviceName: "asc" },
      });

      res.json({
        success: true,
        services: services.map((service) => ({
          ...service,
          price: `$${service.price}`,
          duration: `${service.duration} minutes`,
        })),
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch services",
      });
    }
  }

  // New method: Get available staff
  async getStaff(req, res) {
    try {
      const staff = await prisma.staff.findMany({
        select: {
          staffId: true,
          name: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({
        success: true,
        staff,
      });
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch staff",
      });
    }
  }
}

module.exports = new VapiController();
