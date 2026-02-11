import "dotenv/config";
import { createAndSendNotification } from "./src/services/notification.service.js";

async function trigger() {
    console.log(" Triggering manual notification for Kolam 1...");
    try {
        await createAndSendNotification(
            "1",
            "test_alert",
            "Uji Coba Notifikasi",
            "Test notifikasi bro"
        );
        console.log(" Trigger script finished.");
    } catch (error) {
        console.error(" Trigger failed:", error);
    }
}

trigger();
