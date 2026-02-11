import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const sendNotification = async (tokens, title, body) => {
    if (!tokens || tokens.length === 0) return;

    const message = {
        notification: {
            title,
            body,
        },
        tokens: tokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Firebase Notification sent: ${response.successCount} success, ${response.failureCount} failure`);
        return response;
    } catch (error) {
        console.error("Error sending Firebase notification:", error);
    }
};
