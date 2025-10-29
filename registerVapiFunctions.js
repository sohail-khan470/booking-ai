const { VapiClient } = require("@vapi-ai/server-sdk");
const vapiFunctions = require("./config/functionMap");

// TEMPORARY: Hardcode to test (replace with actual values)
const VAPI_API_KEY = "3dc42034-4fb6-457b-aad5-505745cfb28b"; // Get from Vapi dashboard
const VAPI_ASSISTANT_ID = "d952c931-dcbc-4a79-88db-0eeedda0f91f";

console.log("Using API Key:", VAPI_API_KEY ? "Present" : "Missing");
console.log("Using Assistant ID:", VAPI_ASSISTANT_ID);

const vapi = new VapiClient(VAPI_API_KEY);

(async () => {
  try {
    const functions = Object.keys(vapiFunctions).map((key) => ({
      name: key,
      description: vapiFunctions[key].description,
      parameters: vapiFunctions[key].parameters,
    }));

    console.log(
      "Syncing functions:",
      functions.map((f) => f.name)
    );

    await vapi.assistants.update(VAPI_ASSISTANT_ID, { functions });
    console.log(" Vapi functions synced successfully!");
  } catch (error) {
    console.error(" Error syncing functions:");
    console.error("Status:", error.statusCode);
    console.error("Message:", error.body?.message);
  }
})();
