const { VapiWebhookService } = require("../services/vapi-service");

const vapiWebhookService = new VapiWebhookService();

class VapiWebhookController {
  async handleWebhook(req, res) {
    console.log("=== INCOMING WEBHOOK REQUEST ===");
    console.log("Headers:", req.headers);
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("================================");

    // Validate request method
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed. Only POST requests are accepted.",
      });
    }

    // Validate request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Empty request body received");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook data: Empty request body",
      });
    }

    try {
      // Process based on the actual structure we're receiving
      let webhookData = req.body;

      // If Vapi sends the data in a 'message' field, extract it
      if (req.body.message && typeof req.body.message === "object") {
        webhookData = req.body.message;
        console.log("Extracted data from message field");
      }

      // If it's a string, try to parse it
      if (typeof req.body.message === "string") {
        try {
          webhookData = JSON.parse(req.body.message);
          console.log("Parsed message string as JSON");
        } catch (parseError) {
          console.log("Message is a string but not JSON, using as transcript");
          webhookData = { transcript: req.body.message };
        }
      }

      console.log("Processing webhook data structure:", {
        type: webhookData.type,
        hasCall: !!webhookData.call,
        hasTranscript: !!webhookData.transcript,
        hasMessage: !!webhookData.message,
        keys: Object.keys(webhookData),
      });

      // Generate a unique call ID if not provided
      if (!webhookData.call) {
        webhookData.call = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        console.log("Generated call ID:", webhookData.call.id);
      }

      // Ensure transcript exists
      if (!webhookData.transcript) {
        webhookData.transcript = "No transcript provided in webhook";
        console.log("Added default transcript");
      }

      // Process the webhook data
      const result = await vapiWebhookService.processWebhook(webhookData);

      console.log("Webhook processed successfully:", result);

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Webhook processing failed:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error while processing webhook",
        error: error.message,
      });
    }
  }

  // Health check endpoint
  async healthCheck(req, res) {
    return res.status(200).json({
      success: true,
      message: "Vapi webhook endpoint is healthy and ready to receive calls",
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { VapiWebhookController };
