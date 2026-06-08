import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bluereef.club" },
    update: {},
    create: {
      email: "admin@bluereef.club",
      passwordHash,
      name: "Club Admin",
      role: "ADMIN",
      approved: true,
      certLevel: "INSTRUCTOR",
      diveCount: 500,
      phone: "+86 138 0000 0000",
      emergencyContactName: "Emergency Desk",
      emergencyContactPhone: "+86 120",
    },
  });

  const memberHash = await bcrypt.hash("member123", 10);
  const member = await prisma.user.upsert({
    where: { email: "diver@example.com" },
    update: {},
    create: {
      email: "diver@example.com",
      passwordHash: memberHash,
      name: "Li Wei",
      role: "MEMBER",
      approved: true,
      certLevel: "AOW",
      diveCount: 42,
      phone: "+86 139 0000 0000",
      emergencyContactName: "Li Ming",
      emergencyContactPhone: "+86 139 1111 1111",
    },
  });

  const existingTrip = await prisma.trip.findFirst({
    where: { title: "Weekend Boat Dive · Sanya" },
  });

  if (!existingTrip) {
    const tripDate = new Date();
    tripDate.setDate(tripDate.getDate() + 14);
    tripDate.setHours(8, 0, 0, 0);

    const trip = await prisma.trip.create({
      data: {
        title: "Weekend Boat Dive · Sanya",
        site: "Wuzhizhou Island",
        date: tripDate,
        type: "FUN",
        maxParticipants: 12,
        minCert: "AOW",
        notes:
          "Meet at the marina at 07:30. Bring logbook and certification card.",
        createdById: admin.id,
      },
    });

    await prisma.tripSignup.create({
      data: {
        tripId: trip.id,
        userId: member.id,
        status: "CONFIRMED",
      },
    });
  }

  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: "Welcome to Dive world" },
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: "Welcome to Dive world",
        body: "Our new club app is live. Please complete your profile with emergency contact info before your next trip.",
        pinned: true,
        createdById: admin.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin: admin@bluereef.club / admin123");
  console.log("Member: diver@example.com / member123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });