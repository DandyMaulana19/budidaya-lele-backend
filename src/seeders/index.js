import { userSeeder } from "./users.seeder.js";
import { poolSeeder } from "./pools.seeder.js";
import { seedReportSeeder } from "./seed-reports.seeder.js";
import { feedReportSeeder } from "./feed-reports.seeder.js";
import { harvestReportSeeder } from "./harvest-reports.seeder.js";
import { mortalityReportSeeder } from "./mortality-reports.seeder.js";

async function runSeeders() {
  try {
    const userRows = await userSeeder();
    console.log("✅ Users seeder");
    const poolRows = await poolSeeder(userRows);
    console.log("✅ Pool seeder");

    await seedReportSeeder(userRows, poolRows);
    console.log("✅ Seed Report seeder");
    await feedReportSeeder(userRows, poolRows);
    console.log("✅ Feed Report seeder");
    await harvestReportSeeder(userRows, poolRows);
    console.log("✅ Harvest Report seeder");
    await mortalityReportSeeder(userRows, poolRows);
    console.log("✅ Mortality Report seeder");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSeeders();
