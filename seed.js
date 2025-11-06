// scripts/seedData.js - FIXED VERSION
const { PrismaClient, DayOfWeek } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("Seeding database with initial data...");

  try {
    // 1. Create Services
    const services = [
      {
        serviceName: "Haircut",
        description: "Professional haircut and styling",
        duration: 60,
        price: 35.0,
      },
      {
        serviceName: "Manicure",
        description: "Professional manicure service",
        duration: 45,
        price: 25.0,
      },
      {
        serviceName: "Pedicure",
        description: "Professional pedicure service",
        duration: 60,
        price: 40.0,
      },
      {
        serviceName: "Facial",
        description: "Relaxing facial treatment",
        duration: 90,
        price: 80.0,
      },
      {
        serviceName: "Massage",
        description: "Therapeutic massage",
        duration: 60,
        price: 75.0,
      },
      {
        serviceName: "Hair Coloring",
        description: "Professional hair coloring service",
        duration: 120,
        price: 120.0,
      },
    ];

    for (const serviceData of services) {
      await prisma.service.upsert({
        where: { serviceName: serviceData.serviceName },
        update: serviceData,
        create: serviceData,
      });
      console.log(`Service created/updated: ${serviceData.serviceName}`);
    }

    // 2. Create Staff Members
    const staffMembers = [
      {
        name: "Alex Johnson",
        role: "Senior Stylist",
      },
      {
        name: "Sarah Miller",
        role: "Color Specialist",
      },
      {
        name: "Mike Chen",
        role: "Nail Technician",
      },
    ];

    const createdStaff = [];
    for (const staffData of staffMembers) {
      const staff = await prisma.staff.upsert({
        where: { name: staffData.name },
        update: staffData,
        create: staffData,
      });
      createdStaff.push(staff);
      console.log(`Staff created/updated: ${staffData.name}`);
    }

    // 3. Create Staff Schedules - FIXED VERSION
    const daysOfWeek = Object.values(DayOfWeek); // Use the actual enum values

    // First, delete any existing schedules to avoid duplicates
    await prisma.staffSchedule.deleteMany({});

    for (const staff of createdStaff) {
      for (const day of daysOfWeek) {
        // For weekdays, set business hours; for weekends, shorter hours
        const isWeekend = day === "Saturday" || day === "Sunday";
        const startHour = isWeekend ? 10 : 9; // 10 AM on weekends, 9 AM on weekdays
        const endHour = isWeekend ? 16 : 17; // 4 PM on weekends, 5 PM on weekdays

        await prisma.staffSchedule.create({
          data: {
            staffId: staff.staffId,
            dayOfWeek: day,
            startTime: new Date(
              `1970-01-01T${startHour.toString().padStart(2, "0")}:00:00Z`
            ),
            endTime: new Date(
              `1970-01-01T${endHour.toString().padStart(2, "0")}:00:00Z`
            ),
            isAvailable: true,
          },
        });
      }
      console.log(`Schedules created for staff: ${staff.name}`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seeding
seedDatabase()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
