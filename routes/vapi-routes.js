const express = require("express");
const router = express.Router();
const vapiController = require("../controllers/vapi-controller");

// Webhook endpoint (for Vapi to call your functions)
router.post("/webhook", vapiController.handleWebhook.bind(vapiController));

// Initiate outbound calls
router.post("/calls", vapiController.initiateBookingCall.bind(vapiController));

// Get call status
router.get("/calls/:callId", vapiController.getCallStatus.bind(vapiController));

// Get customer call history
router.get(
  "/calls/history/:phoneNumber",
  vapiController.getCustomerCallHistory.bind(vapiController)
);

// Get available services (for frontend or testing)
router.get("/services", vapiController.getServices.bind(vapiController));

// Get available staff (for frontend or testing)
router.get("/staff", vapiController.getStaff.bind(vapiController));

module.exports = router;
