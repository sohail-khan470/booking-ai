const { PrismaClient, DayOfWeek, Status } = require("@prisma/client");

const prisma = new PrismaClient();

class VapiWebhookService {
  // Extract customer information from transcript - IMPROVED
  extractCustomerInfo(transcript, webhookData) {
    console.log("Extracting customer info from transcript...");
    console.log("Transcript:", transcript);

    // Default values
    let customerInfo = {
      name: "Unknown Customer",
      phoneNumber: "0000000000",
      email: "unknown@example.com", // Already lowercase default
    };

    if (!transcript || transcript === "No transcript provided in webhook") {
      console.log("No transcript available, using defaults");
      return customerInfo;
    }

    // FIRST: Check if we have structured data from Vapi tool calls
    const toolCallData = this.extractFromToolCalls(webhookData);
    console.log("Tool call data:", toolCallData);

    // Use tool call data if we have valid name
    if (toolCallData.name && toolCallData.name !== "Unknown Customer") {
      customerInfo.name = toolCallData.name;

      // ENSURE LOWERCASE EMAIL
      customerInfo.email = toolCallData.email.toLowerCase();

      // Only use phone from tool call if it's valid (not just zeros)
      if (
        toolCallData.phoneNumber &&
        toolCallData.phoneNumber !== "0000000000"
      ) {
        customerInfo.phoneNumber = toolCallData.phoneNumber;
      }

      console.log("Using data from tool calls:", customerInfo);
      return customerInfo;
    }

    // SECOND: Try to extract from transcript
    const extractedData = this.extractFromTranscript(transcript);
    console.log("Extracted data from transcript:", extractedData);

    // Only override defaults if we found actual data
    if (extractedData.name && extractedData.name !== "Unknown Customer") {
      customerInfo.name = extractedData.name;
    }

    // Use phone from transcript if tool call didn't provide a valid one
    if (
      extractedData.phoneNumber &&
      extractedData.phoneNumber !== "0000000000"
    ) {
      customerInfo.phoneNumber = extractedData.phoneNumber;
    }

    // ENSURE LOWERCASE EMAIL from transcript extraction
    if (extractedData.email && extractedData.email !== "unknown@example.com") {
      customerInfo.email = extractedData.email.toLowerCase();
    }

    console.log("Final customer info:", customerInfo);
    return customerInfo;
  }

  // Extract service type from transcript
  extractServiceType(transcript) {
    if (!transcript || transcript === "No transcript provided in webhook") {
      return "Haircut";
    }

    const serviceKeywords = {
      haircut: "Haircut",
      "hair cut": "Haircut",
      manicure: "Manicure",
      pedicure: "Pedicure",
      facial: "Facial",
      massage: "Massage",
      coloring: "Hair Coloring",
      "hair coloring": "Hair Coloring",
      style: "Hair Styling",
      styling: "Hair Styling",
    };

    const lowerTranscript = transcript.toLowerCase();
    for (const [keyword, service] of Object.entries(serviceKeywords)) {
      if (lowerTranscript.includes(keyword)) {
        console.log("Found service:", service);
        return service;
      }
    }

    console.log("Using default service: Haircut");
    return "Haircut";
  }

  // Extract appointment date from various sources - IMPROVED
  extractAppointmentDate(webhookData) {
    console.log("Extracting appointment date...");

    // Try to get from tool calls first - IMPROVED VERSION
    const messages =
      webhookData.artifact?.messages || webhookData.messages || [];

    console.log("Searching through messages for tool calls:", messages.length);

    for (const message of messages) {
      // Check for tool calls in the message
      if (message.toolCalls && Array.isArray(message.toolCalls)) {
        for (const toolCall of message.toolCalls) {
          if (
            toolCall.function &&
            toolCall.function.name === "book_appointment"
          ) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              if (args.date) {
                console.log("Found date in tool call:", args.date);
                const date = new Date(args.date);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            } catch (error) {
              console.error("Error parsing tool call arguments:", error);
            }
          }
        }
      }

      // Also check for functionCall (different structure)
      if (
        message.functionCall &&
        message.functionCall.name === "book_appointment"
      ) {
        try {
          const args = JSON.parse(message.functionCall.arguments);
          if (args.date) {
            console.log("Found date in functionCall:", args.date);
            const date = new Date(args.date);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        } catch (error) {
          console.error("Error parsing functionCall arguments:", error);
        }
      }
    }

    // Fallback: Check if there's direct tool call data in the webhook
    if (
      webhookData.toolCall &&
      webhookData.toolCall.functionName === "book_appointment"
    ) {
      try {
        const args = JSON.parse(webhookData.toolCall.arguments);
        if (args.date) {
          console.log("Found date in direct tool call:", args.date);
          const date = new Date(args.date);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      } catch (error) {
        console.error("Error parsing direct tool call arguments:", error);
      }
    }

    // Final fallback to default date
    let appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    appointmentDate.setHours(15, 0, 0, 0);

    console.log("Using default appointment date:", appointmentDate);
    return appointmentDate;
  }

  // Convert Date to DayOfWeek enum
  getDayOfWeek(date) {
    const days = [
      DayOfWeek.Sunday,
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday,
      DayOfWeek.Saturday,
    ];
    return days[date.getDay()];
  }

  // Find or create customer - UPDATED TO ENSURE LOWERCASE EMAIL
  async findOrCreateCustomer(customerInfo) {
    console.log("Finding or creating customer:", customerInfo);

    // ENSURE email is lowercase before database operations
    const normalizedEmail = customerInfo.email.toLowerCase();

    // Try to find by email first (using lowercase), then phone
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phoneNumber: customerInfo.phoneNumber },
        ],
      },
    });

    if (!customer) {
      console.log("Creating new customer");
      customer = await prisma.customer.create({
        data: {
          name: customerInfo.name,
          email: normalizedEmail, // Store as lowercase
          phoneNumber: customerInfo.phoneNumber,
        },
      });
    } else {
      console.log("Updating existing customer:", customer.customerId);
      // Update existing customer info if needed
      customer = await prisma.customer.update({
        where: { customerId: customer.customerId },
        data: {
          name: customerInfo.name,
          email: normalizedEmail, // Always update to lowercase
          phoneNumber: customerInfo.phoneNumber || customer.phoneNumber,
        },
      });
    }

    return customer;
  }

  // Find service by name
  async findService(serviceName) {
    console.log("Finding service:", serviceName);

    // First, try exact match
    let service = await prisma.service.findFirst({
      where: {
        serviceName: serviceName,
      },
    });

    // If not found, try case-insensitive search manually
    if (!service) {
      const allServices = await prisma.service.findMany();
      service = allServices.find((s) =>
        s.serviceName.toLowerCase().includes(serviceName.toLowerCase())
      );
    }

    // If still not found, create the service
    if (!service) {
      console.log("Creating new service:", serviceName);
      service = await prisma.service.create({
        data: {
          serviceName: serviceName,
          description: `Auto-created service for ${serviceName}`,
          duration: 60, // Default 60 minutes
          price: 50.0, // Default price
        },
      });
    }

    return service;
  }

  // Find available staff
  async findAvailableStaff(appointmentDate) {
    console.log("Finding available staff for:", appointmentDate);

    const dayOfWeek = this.getDayOfWeek(appointmentDate);

    const availableStaff = await prisma.staff.findFirst({
      include: {
        schedules: {
          where: {
            dayOfWeek: dayOfWeek,
            isAvailable: true,
          },
        },
      },
    });

    if (!availableStaff) {
      console.log("No staff found, creating default staff");
      // Create a default staff member if none available
      const defaultStaff = await prisma.staff.create({
        data: {
          name: "Default Stylist",
          role: "Senior Stylist",
        },
      });

      // Create a default schedule for all days
      const days = Object.values(DayOfWeek);
      for (const day of days) {
        await prisma.staffSchedule.create({
          data: {
            staffId: defaultStaff.staffId,
            dayOfWeek: day,
            startTime: new Date("1970-01-01T09:00:00Z"), // 9 AM
            endTime: new Date("1970-01-01T17:00:00Z"), // 5 PM
            isAvailable: true,
          },
        });
      }

      return defaultStaff;
    }

    return availableStaff;
  }

  // Create call log with duplicate handling
  async createCallLog(callData) {
    try {
      // First, check if call log already exists
      const existingCallLog = await prisma.callLog.findUnique({
        where: {
          callId: callData.callId,
        },
      });

      // Clean the transcript if it's too long (though @db.Text should handle it)
      const cleanTranscript = callData.transcript || "No transcript available";

      if (existingCallLog) {
        console.log("Call log already exists, updating:", callData.callId);
        return await prisma.callLog.update({
          where: { callId: callData.callId },
          data: {
            transcript: cleanTranscript,
            recordingUrl: callData.recordingUrl,
            cost: callData.cost,
            status: callData.status,
            appointmentId: callData.appointmentId,
          },
        });
      } else {
        console.log("Creating new call log:", callData.callId);
        return await prisma.callLog.create({
          data: {
            ...callData,
            transcript: cleanTranscript,
          },
        });
      }
    } catch (error) {
      console.error("Error creating/updating call log:", error);
      throw error;
    }
  }

  // Create or update slot - FIXED VERSION
  async createOrUpdateSlot(staffId, appointmentDate, endTime) {
    try {
      // Format dates properly - FIXED
      const slotDate = new Date(appointmentDate);
      slotDate.setHours(0, 0, 0, 0); // Set to start of day

      const slotStartTime = new Date(appointmentDate);

      console.log("Creating/updating slot with:", {
        staffId,
        date: slotDate,
        startTime: slotStartTime,
        endTime,
      });

      await prisma.slot.upsert({
        where: {
          staffId_date_startTime: {
            // This now matches the @@unique constraint
            staffId: staffId,
            date: slotDate,
            startTime: slotStartTime,
          },
        },
        update: {
          isBooked: true,
          endTime: endTime,
        },
        create: {
          staffId: staffId,
          date: slotDate,
          startTime: slotStartTime,
          endTime: endTime,
          isBooked: true,
        },
      });

      console.log("Slot created/updated successfully");
    } catch (error) {
      console.error("Error creating/updating slot:", error);
      // Don't throw error for slot issues, as the appointment is already created
    }
  }

  // Main method to process webhook - IMPROVED VERSION
  async processWebhook(webhookData) {
    try {
      console.log("=== STARTING WEBHOOK PROCESSING ===");
      console.log("Webhook call ID:", webhookData.call?.id);
      console.log("Webhook type:", webhookData.type);

      const { transcript, call, cost, recordingUrl } = webhookData;

      const callId =
        call?.id ||
        `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("Using call ID:", callId);

      // IMPROVED: Pass the entire webhookData to extractCustomerInfo
      const customerInfo = this.extractCustomerInfo(transcript, webhookData);
      const serviceType = this.extractServiceType(transcript);
      const appointmentDate = this.extractAppointmentDate(webhookData);

      console.log("Extracted appointment data:", {
        customer: customerInfo,
        service: serviceType,
        date: appointmentDate.toISOString(),
      });

      // Only create appointment if we have real customer data
      if (customerInfo.name === "Unknown Customer") {
        console.log(
          "No customer data found, creating minimal record for tracking"
        );

        // Create a basic call log without appointment
        const callLog = await this.createCallLog({
          callId: callId,
          phoneNumber: customerInfo.phoneNumber,
          transcript: transcript || "No transcript available",
          recordingUrl: recordingUrl,
          cost: cost,
          status: "completed-no-booking",
          appointmentId: null,
        });

        return {
          success: true,
          callLogId: callLog.callLogId,
          customer: customerInfo.name,
          service: "No service booked",
          appointmentDate: null,
          note: "Call completed but no appointment data collected",
        };
      }

      // Rest of your existing code for creating appointments...
      const customer = await this.findOrCreateCustomer(customerInfo);
      const service = await this.findService(serviceType);
      const staff = await this.findAvailableStaff(appointmentDate);

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          customerId: customer.customerId,
          serviceId: service.serviceId,
          staffId: staff.staffId,
          appointmentDate: appointmentDate,
          status: Status.CONFIRMED,
        },
      });

      console.log("Appointment created:", appointment.appointmentId);

      // Create call log
      const callLog = await this.createCallLog({
        callId: callId,
        phoneNumber: customer.phoneNumber,
        transcript: transcript || "No transcript available",
        recordingUrl: recordingUrl,
        cost: cost,
        status: "completed",
        appointmentId: appointment.appointmentId,
      });

      console.log("Call log created/updated:", callLog.callLogId);

      // Create or update slot
      const endTime = new Date(
        appointmentDate.getTime() + service.duration * 60000
      );
      await this.createOrUpdateSlot(staff.staffId, appointmentDate, endTime);

      console.log("=== WEBHOOK PROCESSING COMPLETED ===");

      return {
        success: true,
        appointmentId: appointment.appointmentId,
        callLogId: callLog.callLogId,
        customer: customer.name,
        service: service.serviceName,
        appointmentDate: appointmentDate.toISOString(),
      };
    } catch (error) {
      console.error("=== WEBHOOK PROCESSING FAILED ===");
      console.error("Error:", error);

      // Error handling...
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  // Extract data from Vapi tool calls - FIXED PHONE NUMBER HANDLING
  extractFromToolCalls(webhookData) {
    console.log("Checking for tool call data...");

    const toolCallData = {
      name: "Unknown Customer",
      phoneNumber: null, // Change to null initially
      email: "unknown@example.com", // Already lowercase default
    };

    try {
      const messages =
        webhookData.artifact?.messages || webhookData.messages || [];

      for (const message of messages) {
        if (message.toolCalls && Array.isArray(message.toolCalls)) {
          for (const toolCall of message.toolCalls) {
            if (
              toolCall.function &&
              toolCall.function.name === "book_appointment"
            ) {
              const args = JSON.parse(toolCall.function.arguments);
              console.log("Found tool call arguments:", args);

              if (args.name) toolCallData.name = args.name;

              // ENSURE LOWERCASE EMAIL from tool calls
              if (args.email) toolCallData.email = args.email.toLowerCase();

              // IMPROVED PHONE NUMBER EXTRACTION
              if (args.phoneNumber) {
                console.log(
                  "Raw phone number from tool call:",
                  args.phoneNumber
                );

                // Extract only digits
                let phoneDigits = args.phoneNumber.replace(/\D/g, "");
                console.log("Phone digits after cleaning:", phoneDigits);

                // Try to find a valid phone number pattern
                if (phoneDigits.length >= 10) {
                  // Take the first 10 digits (standard US number)
                  toolCallData.phoneNumber = phoneDigits.substring(0, 10);
                } else if (phoneDigits.length > 0) {
                  // If less than 10 digits but has some numbers, use what we have
                  toolCallData.phoneNumber = phoneDigits;
                } else {
                  // No valid phone number found
                  toolCallData.phoneNumber = "0000000000";
                }

                console.log("Final phone number:", toolCallData.phoneNumber);
              } else {
                toolCallData.phoneNumber = "0000000000";
              }

              return toolCallData;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting from tool calls:", error);
    }

    // If no phone number was set, set default
    if (!toolCallData.phoneNumber) {
      toolCallData.phoneNumber = "0000000000";
    }

    return toolCallData;
  }

  // Improved transcript parsing - BETTER PHONE EXTRACTION
  extractFromTranscript(transcript) {
    const extracted = {
      name: "Unknown Customer",
      phoneNumber: null,
      email: "unknown@example.com", // Already lowercase default
    };

    const lines = transcript.split("\n");

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Extract name (your existing logic)
      if (extracted.name === "Unknown Customer") {
        const namePatterns = [
          /(?:my name is|i'm|this is|it's|call me)[\s,]+([a-z][a-z\s]{1,30})(?:\.|\s|$)/i,
          /(?:name['\s]s?[\s:]+)([a-z][a-z\s]{1,30})(?:\.|\s|$)/i,
        ];

        for (const pattern of namePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            const name = match[1].trim();
            if (
              name.length > 1 &&
              !name.includes("ai") &&
              !name.includes("assistant")
            ) {
              extracted.name = this.formatName(name);
              console.log("Found name from transcript:", extracted.name);
              break;
            }
          }
        }
      }

      // IMPROVED PHONE NUMBER EXTRACTION FROM TRANSCRIPT
      if (!extracted.phoneNumber) {
        console.log("Looking for phone number in line:", line);

        // Multiple patterns for phone numbers
        const phonePatterns = [
          /(?:phone|number|call me at|mobile|cell)[\s:]*([0-9\s\-\(\)\.]{10,20})/i,
          /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/,
          /\b(\d{10})\b/,
          /zero\s*three\s*five\s*zero\s*nine\s*two\s*six\s*one\s*four/i, // For "zero three five zero nine two six one four"
        ];

        for (const pattern of phonePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            console.log("Phone match found:", match[1]);

            let phone = match[1];

            // Handle spelled-out numbers like "zero three five zero nine two six one four"
            if (pattern.toString().includes("zero")) {
              phone = phone
                .replace(/zero/gi, "0")
                .replace(/one/gi, "1")
                .replace(/two/gi, "2")
                .replace(/three/gi, "3")
                .replace(/four/gi, "4")
                .replace(/five/gi, "5")
                .replace(/six/gi, "6")
                .replace(/seven/gi, "7")
                .replace(/eight/gi, "8")
                .replace(/nine/gi, "9")
                .replace(/\s+/g, "");
            }

            // Extract only digits
            const phoneDigits = phone.replace(/\D/g, "");
            console.log("Cleaned phone digits:", phoneDigits);

            if (phoneDigits.length >= 10) {
              extracted.phoneNumber = phoneDigits.substring(0, 10);
              console.log(
                "Final phone number from transcript:",
                extracted.phoneNumber
              );
              break;
            } else if (phoneDigits.length > 0) {
              extracted.phoneNumber = phoneDigits;
              console.log(
                "Short phone number from transcript:",
                extracted.phoneNumber
              );
              break;
            }
          }
        }
      }

      // Extract email - ENSURE LOWERCASE
      if (extracted.email === "unknown@example.com") {
        const emailMatch = line.match(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
        );
        if (emailMatch) {
          extracted.email = emailMatch[1].toLowerCase(); // Convert to lowercase immediately
          console.log("Found email from transcript:", extracted.email);
        }
      }
    }

    // Set default if no phone number found
    if (!extracted.phoneNumber) {
      extracted.phoneNumber = "0000000000";
    }

    return extracted;
  }

  formatName(name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  }
}

module.exports = { VapiWebhookService };
