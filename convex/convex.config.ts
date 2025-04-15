import { defineApp } from "convex/server";
import pushNotifications from "@convex-dev/expo-push-notifications/convex.config";

const app = defineApp();
app.use(pushNotifications);

export default app;