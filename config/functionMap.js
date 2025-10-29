const vapiFunctions = {
  bookAppointment: {
    description: "Books a salon appointment for a customer.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Customer's name" },
        date: { type: "string", description: "Appointment date/time" },
        service: {
          type: "string",
          description:
            "Service type (Manicure, Hair Coloring, Haircut, Facial, Pedicure, Massage)",
        },
        staffId: { type: "number", description: "Staff member ID" },
      },
      required: ["name", "date", "service", "staffId"],
    },
    handler: async ({ name, date, service, staffId }) => {
      try {
        // Step 1: Find or create customer
        let customer = await prisma.customer.findFirst({
          where: { name },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: { name },
          });
        }

        // Step 2: Dynamically find service by name
        const serviceRecord = await prisma.service.findFirst({
          where: {
            serviceName: {
              contains: service,
              mode: "insensitive",
            },
          },
        });

        if (!serviceRecord) {
          // Get available services for error message
          const availableServices = await prisma.service.findMany({
            select: { serviceName: true },
          });
          return {
            success: false,
            message: `Service '${service}' not found. Available services: ${availableServices
              .map((s) => s.serviceName)
              .join(", ")}`,
          };
        }

        // Step 3: Verify staff exists
        const staff = await prisma.staff.findUnique({
          where: { staffId: parseInt(staffId) },
        });

        if (!staff) {
          return {
            success: false,
            message: `Staff member with ID ${staffId} not found`,
          };
        }

        const appointmentDateTime = new Date(date);
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            staffId: parseInt(staffId),
            appointmentDate: appointmentDateTime,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });

        if (conflictingAppointment) {
          return {
            success: false,
            message: `Staff #${staffId} is already booked at that time. Please choose a different time or staff member.`,
          };
        }

        // Step 5: Create appointment
        const appointment = await prisma.appointment.create({
          data: {
            customerId: customer.customerId,
            serviceId: serviceRecord.serviceId,
            staffId: parseInt(staffId),
            appointmentDate: appointmentDateTime,
            status: "PENDING",
          },
          include: {
            service: { select: { serviceName: true, price: true } },
            staff: { select: { name: true } },
          },
        });

        return {
          success: true,
          message: `Appointment booked for ${name} on ${appointmentDateTime.toLocaleString()} for ${
            serviceRecord.serviceName
          } ($${serviceRecord.price}) with ${appointment.staff.name}.`,
          appointmentId: appointment.appointmentId,
          price: serviceRecord.price,
          duration: serviceRecord.duration,
        };
      } catch (error) {
        console.error("Booking error:", error);
        return {
          success: false,
          message: `Failed to book appointment: ${error.message}`,
        };
      }
    },
  },

  getAvailableSlots: {
    description:
      "Lists open time slots for a given day and optional staff member.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date to check (YYYY-MM-DD)" },
        staffId: { type: "number", description: "Optional staff member ID" },
      },
      required: ["date"],
    },
    handler: async ({ date, staffId }) => {
      try {
        // Query available slots from your Slot model
        const availableSlots = await prisma.slot.findMany({
          where: {
            date: {
              gte: new Date(`${date}T00:00:00`),
              lt: new Date(`${date}T23:59:59`),
            },
            isBooked: false,
            ...(staffId && { staffId: parseInt(staffId) }),
          },
          include: {
            staff: {
              select: { name: true, staffId: true, role: true },
            },
          },
          orderBy: { startTime: "asc" },
        });

        if (availableSlots.length === 0) {
          return {
            success: true,
            message: `No available slots found for ${date}${
              staffId ? ` for staff #${staffId}` : ""
            }`,
            availableSlots: [],
          };
        }

        const formattedSlots = availableSlots.map((slot) => ({
          slotId: slot.slotId,
          time: `${slot.startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${slot.endTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          staff: `${slot.staff.name} (${slot.staff.role})`,
          staffId: slot.staff.staffId,
        }));

        return {
          success: true,
          availableSlots: formattedSlots,
          date: date,
          totalSlots: formattedSlots.length,
        };
      } catch (error) {
        console.error("Slots error:", error);
        return {
          success: false,
          message: `Error fetching slots: ${error.message}`,
        };
      }
    },
  },

  getServices: {
    description: "Get all available services with prices and durations",
    parameters: {
      type: "object",
      properties: {},
    },
    handler: async () => {
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

        return {
          success: true,
          services: services.map((service) => ({
            ...service,
            price: `$${service.price}`,
            duration: `${service.duration} minutes`,
          })),
        };
      } catch (error) {
        console.error("Services error:", error);
        return {
          success: false,
          message: `Error fetching services: ${error.message}`,
        };
      }
    },
  },

  getStaff: {
    description: "Get all available staff members",
    parameters: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      try {
        const staff = await prisma.staff.findMany({
          select: {
            staffId: true,
            name: true,
            role: true,
          },
          orderBy: { name: "asc" },
        });

        return {
          success: true,
          staff: staff,
        };
      } catch (error) {
        console.error("Staff error:", error);
        return {
          success: false,
          message: `Error fetching staff: ${error.message}`,
        };
      }
    },
  },
};
