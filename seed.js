const { PrismaClient, DayOfWeek, Status } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.callLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();

  // Create Services
  console.log("Creating services...");
  const services = await Promise.all([
    prisma.service.create({
      data: {
        serviceName: "Haircut",
        description: "Professional haircut and styling",
        duration: 30,
        price: 25.0,
      },
    }),
    prisma.service.create({
      data: {
        serviceName: "Hair Coloring",
        description: "Full hair coloring service",
        duration: 90,
        price: 75.0,
      },
    }),
    prisma.service.create({
      data: {
        serviceName: "Manicure",
        description: "Basic manicure service",
        duration: 45,
        price: 30.0,
      },
    }),
    prisma.service.create({
      data: {
        serviceName: "Pedicure",
        description: "Relaxing pedicure treatment",
        duration: 60,
        price: 40.0,
      },
    }),
    prisma.service.create({
      data: {
        serviceName: "Facial",
        description: "Deep cleansing facial treatment",
        duration: 60,
        price: 55.0,
      },
    }),
    prisma.service.create({
      data: {
        serviceName: "Massage",
        description: "Therapeutic massage session",
        duration: 60,
        price: 65.0,
      },
    }),
  ]);

  // Create Staff
  console.log("Creating staff members...");
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: "Sarah Johnson",
        role: "Hair Stylist",
      },
    }),
    prisma.staff.create({
      data: {
        name: "Michael Chen",
        role: "Barber",
      },
    }),
    prisma.staff.create({
      data: {
        name: "Emily Rodriguez",
        role: "Nail Technician",
      },
    }),
    prisma.staff.create({
      data: {
        name: "David Kim",
        role: "Massage Therapist",
      },
    }),
    prisma.staff.create({
      data: {
        name: "Jessica Williams",
        role: "Esthetician",
      },
    }),
  ]);

  // Create Staff Schedules
  console.log("Creating staff schedules...");
  const workingDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const staffMember of staff) {
    for (const day of workingDays) {
      await prisma.staffSchedule.create({
        data: {
          staffId: staffMember.staffId,
          dayOfWeek: day,
          startTime: new Date("2024-01-01T09:00:00"),
          endTime: new Date("2024-01-01T17:00:00"),
          isAvailable: true,
        },
      });
    }
  }

  // Create Customers
  console.log("Creating customers...");
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "John Smith",
        phoneNumber: "+1234567890",
        email: "john.smith@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Emma Davis",
        phoneNumber: "+1234567891",
        email: "emma.davis@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Robert Brown",
        phoneNumber: "+1234567892",
        email: "robert.brown@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Olivia Wilson",
        phoneNumber: "+1234567893",
        email: "olivia.wilson@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "James Taylor",
        phoneNumber: "+1234567894",
        email: "james.taylor@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Sophia Martinez",
        phoneNumber: "+1234567895",
        email: "sophia.martinez@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "William Anderson",
        phoneNumber: "+1234567896",
        email: "william.anderson@example.com",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Ava Garcia",
        phoneNumber: "+1234567897",
        email: "ava.garcia@example.com",
      },
    }),
  ]);

  // Create Slots for next 7 days
  console.log("Creating available time slots...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);

    for (const staffMember of staff) {
      // Create slots from 9 AM to 5 PM with 1-hour intervals
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(slotDate);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(slotDate);
        endTime.setHours(hour + 1, 0, 0, 0);

        await prisma.slot.create({
          data: {
            staffId: staffMember.staffId,
            date: slotDate,
            startTime: startTime,
            endTime: endTime,
            isBooked: Math.random() > 0.7, // 30% of slots are booked
          },
        });
      }
    }
  }

  // Create Appointments
  console.log("Creating appointments...");
  const statuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

  for (let i = 0; i < 15; i++) {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];
    const randomStaff = staff[Math.floor(Math.random() * staff.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Create appointment time (random hour between 9-16)
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
    appointmentDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

    await prisma.appointment.create({
      data: {
        customerId: randomCustomer.customerId,
        serviceId: randomService.serviceId,
        staffId: randomStaff.staffId,
        appointmentDate: appointmentDate,
        status: randomStatus,
      },
    });
  }

  // Create Call Logs
  console.log("Creating call logs...");
  const appointments = await prisma.appointment.findMany();

  for (let i = 0; i < 10; i++) {
    const randomAppointment =
      appointments[Math.floor(Math.random() * appointments.length)];
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];

    await prisma.callLog.create({
      data: {
        callId: `CALL-${Date.now()}-${i}`,
        phoneNumber: randomCustomer.phoneNumber,
        transcript: `Customer called to ${
          i % 3 === 0 ? "book" : i % 3 === 1 ? "reschedule" : "cancel"
        } an appointment.`,
        status: i % 2 === 0 ? "completed" : "missed",
        appointmentId: i % 2 === 0 ? randomAppointment.appointmentId : null,
      },
    });
  }

  console.log("Seeding completed successfully!");
  console.log(`
Summary:
- Services: ${services.length}
- Staff: ${staff.length}
- Customers: ${customers.length}
- Appointments: ${appointments.length}
- Call Logs: 10
- Staff Schedules: ${staff.length * workingDays.length}
- Slots: ${staff.length * 7 * 8}
  `);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
