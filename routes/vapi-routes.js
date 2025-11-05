const express = require("express");

const { VapiWebhookController } = require("../controllers/vapi-controller");

const router = express.Router();
const vapiWebhookController = new VapiWebhookController();

// Webhook endpoint
router.post("/webhook", (req, res) =>
  vapiWebhookController.handleWebhook(req, res)
);

// Health check endpoint
router.get("/health", (req, res) =>
  vapiWebhookController.healthCheck(req, res)
);

module.exports = router;
