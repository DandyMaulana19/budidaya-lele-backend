// import { seed } from "drizzle-seed";
// import { drizzle } from "drizzle-orm/node-postgres";
// import postgres from "postgres";
// import bcrypt from "bcrypt";
// import {
//   users,
//   pool,
//   seedReport,
//   feedReport,
//   harvestReport,
//   mortalityReport,
// } from "./schema/schema.js";
// import { randomUUID } from "crypto";
// import "dotenv/config";

// async function seeder() {
//   try {
//     const client = postgres(process.env.URL_POSTGRES);
//     const db = drizzle(client);

//     const seeder = new seed(db);

//     // ✅ Seed Users
//     const userRows = await seeder.seed(users, {
//       count: 2,
//       transformer: (i) => {
//         if (i === 0) {
//           return {
//             id: randomUUID(),
//             name: "Owner User",
//             email: "owner@example.com",
//             password: bcrypt.hash("password123", 10),
//             role: "owner",
//           };
//         }
//         return {
//           id: randomUUID(),
//           name: "Employee User",
//           email: "employee@example.com",
//           password: bcrypt.hash("password123", 10),
//           role: "employee",
//         };
//       },
//     });

//     console.log("✅ Users seeded:", userRows.length);

//     // ✅ Seed Pools
//     const poolRows = await seeder.seed(pool, {
//       count: 2,
//       transformer: (i) => {
//         return {
//           id: randomUUID(),
//           userId: userRows[i].id,
//           name: `Kolam ${i + 1}`,
//           temprature: 28.5,
//           acidity: 7.2,
//         };
//       },
//     });

//     console.log("✅ Pool seeded:", poolRows.length);

//     // ✅ Seed Seed Report
//     await seeder.seed(seedReport, {
//       count: 2,
//       transformer: (i) => ({
//         id: randomUUID(),
//         userId: userRows[i].id,
//         poolId: poolRows[i].id,
//         reportDate: new Date(),
//         initialAmount: 1000,
//         currentAmount: 980,
//         averageWeight: 0.45,
//       }),
//     });
//     console.log("✅ Seed Report seeded");

//     // ✅ Feed Report
//     await seeder.seed(feedReport, {
//       count: 2,
//       transformer: (i) => ({
//         id: randomUUID(),
//         userId: userRows[i].id,
//         poolId: poolRows[i].id,
//         reportDate: new Date(),
//         imageUrl: "https://example.com/feed.jpg",
//       }),
//     });
//     console.log("✅ Feed Report seeded");

//     // ✅ Harvest Report
//     await seeder.seed(harvestReport, {
//       count: 2,
//       transformer: (i) => ({
//         id: randomUUID(),
//         userId: userRows[i].id,
//         poolId: poolRows[i].id,
//         reportDate: new Date(),
//         quantity: 100,
//         imageUrl: "https://example.com/harvest.jpg",
//       }),
//     });
//     console.log("✅ Harvest Report seeded");

//     // ✅ Mortality Report
//     await seeder.seed(mortalityReport, {
//       count: 2,
//       transformer: (i) => ({
//         id: randomUUID(),
//         userId: userRows[i].id,
//         poolId: poolRows[i].id,
//         reportDate: new Date(),
//         quantity: 5,
//         imageUrl: "https://example.com/mortality.jpg",
//       }),
//     });
//     console.log("✅ Mortality Report seeded");

//     console.log("🎉 SEMUA DATA SELESAI DISEED ✅");
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error saat seeding:", err);
//     process.exit(1);
//   }
// }

// seeder();
