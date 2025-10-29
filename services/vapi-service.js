const { VapiClient } = require("@vapi-ai/server-sdk");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const vapiFunctions = require("../config/functionMap");

class VapiService {
  constructor() {
    this.vapi = new VapiClient(process.env.VAPI_API_KEY);
  }

  // Handle real-time function calls from Vapi webhook
  async handleFunctionCall(functionName, parameters) {
    try {
      console.log(` Handling function call: ${functionName}`, parameters);

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

  // Webhook handler for all Vapi events
  async handleWebhook(webhookData) {
    console.log(" Webhook received:", JSON.stringify(webhookData, null, 2));

    switch (webhookData.type) {
      case "function-call":
        return await this.handleFunctionCall(
          webhookData.functionCall.name,
          webhookData.functionCall.parameters
        );

      case "conversation-update":
        if (webhookData.conversation?.status === "ended") {
          await this.processCompletedCall(webhookData);
        }
        return { status: "ok" };

      case "transcript":
        // Handle real-time transcript updates if needed
        return { status: "ok" };

      default:
        return { status: "ok" };
    }
  }

  // Updated processCompletedCall to work with actual function data
  async processCompletedCall(callData) {
    try {
      const { conversation, transcript, messages } = callData;
      // Check if an appointment was actually booked during the call
      const appointmentBooked = messages?.some(
        (msg) =>
          msg.functionCall?.name === "bookAppointment" &&
          msg.functionCall?.result?.success === true
      );

      if (appointmentBooked) {
        const lastAppointmentCall = messages
          .filter((msg) => msg.functionCall?.name === "bookAppointment")
          .pop();

        if (lastAppointmentCall?.functionCall?.result) {
          const appointmentResult = lastAppointmentCall.functionCall.result;

          // Log the successful call with appointment ID
          await prisma.callLog.create({
            data: {
              callId: conversation.id,
              phoneNumber: conversation.customer?.phoneNumber,
              transcript: transcript,
              status: conversation.status,
              appointmentId: appointmentResult.appointmentId,
            },
          });

          console.log(
            ` Call ${conversation.id} completed with appointment ${appointmentResult.appointmentId}`
          );
        }
      } else {
        // Log call without appointment
        await prisma.callLog.create({
          data: {
            callId: conversation.id,
            phoneNumber: conversation.customer?.phoneNumber,
            transcript: transcript,
            status: conversation.status,
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error processing completed call:", error);
      return { success: false, error: error.message };
    }
  }

  // Existing methods for outbound calls
  async createBookingCall(phoneNumber, customerData = {}) {
    try {
      const call = await this.vapi.calls.create({
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumber,
        customer: customerData,
      });
      return call;
    } catch (error) {
      console.error("Error creating booking call:", error);
      throw error;
    }
  }

  async getCallDetails(callId) {
    try {
      const call = await this.vapi.calls.get(callId);
      return call;
    } catch (error) {
      console.error("Error fetching call details:", error);
      throw error;
    }
  }

  async getCustomerCalls(phoneNumber) {
    try {
      const calls = await prisma.callLog.findMany({
        where: { phoneNumber },
        orderBy: { createdAt: "desc" },
      });
      return calls;
    } catch (error) {
      console.error("Error fetching customer calls:", error);
      throw error;
    }
  }
}

module.exports = new VapiService();
