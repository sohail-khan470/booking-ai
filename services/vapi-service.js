const { PrismaClient, DayOfWeek, Status } = require("@prisma/client");

const prisma = new PrismaClient();

class VapiWebhookService {
  // Extract customer information from transcript
  extractCustomerInfo(transcript) {
    console.log("Extracting customer info from transcript...");

    // Default values
    let customerInfo = {
      name: "Unknown Customer",
      phoneNumber: "0000000000",
      email: "unknown@example.com",
    };

    if (!transcript || transcript === "No transcript provided in webhook") {
      return customerInfo;
    }

    const lines = transcript.split("\n");

    for (const line of lines) {
      // Extract name patterns
      if (
        line.includes("name is") &&
        customerInfo.name === "Unknown Customer"
      ) {
        const nameMatch =
          line.match(/name is\s+([A-Za-z\s]+)\.?/i) ||
          line.match(/([A-Za-z]+\s+[A-Za-z]+)(?=\s+phone|$|\.)/i);
        if (nameMatch) {
          customerInfo.name = nameMatch[1].trim();
          console.log("Found name:", customerInfo.name);
        }
      }

      // Extract phone number patterns
      if (
        (line.includes("phone") || line.includes("number")) &&
        customerInfo.phoneNumber === "0000000000"
      ) {
        const phoneMatch = line.match(/(\d{6,})/);
        if (phoneMatch) {
          customerInfo.phoneNumber = phoneMatch[1];
          console.log("Found phone:", customerInfo.phoneNumber);
        }
      }

      // Extract email patterns
      if (line.includes("@") && customerInfo.email === "unknown@example.com") {
        const emailMatch = line.match(
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
        );
        if (emailMatch) {
          customerInfo.email = emailMatch[1];
          console.log("Found email:", customerInfo.email);
        }
      }
    }

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

  // Extract appointment date from various sources
  extractAppointmentDate(webhookData) {
    console.log("Extracting appointment date...");

    // Try to get from tool calls first
    const messages =
      webhookData.artifact?.messages || webhookData.messages || [];

    for (const message of messages) {
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
                return new Date(args.date);
              }
            } catch (error) {
              console.error("Error parsing tool call arguments:", error);
            }
          }
        }
      }
    }

    // Fallback to transcript analysis
    const transcript = webhookData.transcript || "";
    let appointmentDate = new Date();

    // Default to tomorrow at 3 PM
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

  // Find or create customer
  async findOrCreateCustomer(customerInfo) {
    console.log("Finding or creating customer:", customerInfo);

    // Try to find by email first, then phone
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: customerInfo.email },
          { phoneNumber: customerInfo.phoneNumber },
        ],
      },
    });

    if (!customer) {
      console.log("Creating new customer");
      customer = await prisma.customer.create({
        data: {
          name: customerInfo.name,
          email: customerInfo.email,
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
          email: customerInfo.email || customer.email,
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

      if (existingCallLog) {
        console.log("Call log already exists, updating:", callData.callId);
        return await prisma.callLog.update({
          where: { callId: callData.callId },
          data: {
            transcript: callData.transcript,
            recordingUrl: callData.recordingUrl,
            cost: callData.cost,
            status: callData.status,
            appointmentId: callData.appointmentId,
          },
        });
      } else {
        console.log("Creating new call log:", callData.callId);
        return await prisma.callLog.create({
          data: callData,
        });
      }
    } catch (error) {
      console.error("Error creating/updating call log:", error);
      throw error;
    }
  }

  // Create or update slot
  async createOrUpdateSlot(staffId, appointmentDate, endTime) {
    try {
      // Format dates properly for the unique constraint
      const slotDate = new Date(appointmentDate.toDateString());
      const slotStartTime = new Date(appointmentDate);

      await prisma.slot.upsert({
        where: {
          staffId_date_startTime: {
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

  // Main method to process webhook
  async processWebhook(webhookData) {
    try {
      console.log("=== STARTING WEBHOOK PROCESSING ===");
      console.log("Webhook call ID:", webhookData.call?.id);
      console.log("Webhook type:", webhookData.type);

      const { transcript, call, cost, recordingUrl } = webhookData;

      // Generate unique call ID if not provided
      const callId =
        call?.id ||
        `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("Using call ID:", callId);

      // Extract data from webhook
      const customerInfo = this.extractCustomerInfo(transcript);
      const serviceType = this.extractServiceType(transcript);
      const appointmentDate = this.extractAppointmentDate(webhookData);

      console.log("Extracted appointment data:", {
        customer: customerInfo,
        service: serviceType,
        date: appointmentDate.toISOString(),
      });

      // Database operations
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

      // Create call log with duplicate handling
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

      // Create or update slot (non-blocking)
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

      // Create failed call log for tracking (with unique ID)
      if (webhookData.call?.id) {
        try {
          await this.createCallLog({
            callId: webhookData.call.id,
            status: "failed",
            transcript: webhookData.transcript || "No transcript",
            cost: webhookData.cost,
          });
        } catch (logError) {
          console.error("Failed to create error call log:", logError);
        }
      }

      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }
}

module.exports = { VapiWebhookService };
