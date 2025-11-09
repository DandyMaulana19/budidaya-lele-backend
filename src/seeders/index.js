import { userSeeders } from "./users.seeder.js";
import { poolSeeders } from "./pools.seeder.js";
import { seedReportSeeders } from "./seed-reports.seeder.js";
import { feedReportSeeders } from "./feed-reports.seeder.js";
import { harvestReportSeeders } from "./harvest-reports.seeder.js";
import { mortalityReportSeeders } from "./mortality-reports.seeder.js";

async function runSeeders() {
  try {
    const userRows = await userSeeders();
    console.log("✅ Users seeder");
    const poolRows = await poolSeeders(userRows);
    console.log("✅ Pool seeder");

    await seedReportSeeders(userRows, poolRows);
    console.log("✅ Seed Report seeder");
    await feedReportSeeders(userRows, poolRows);
    console.log("✅ Feed Report seeder");
    await harvestReportSeeders(userRows, poolRows);
    console.log("✅ Harvest Report seeder");
    await mortalityReportSeeders(userRows, poolRows);
    console.log("✅ Mortality Report seeder");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSeeders();
