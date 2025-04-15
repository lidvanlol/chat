// convex/notifications.ts
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
export const sendExpoNotification = internalAction({
  args: {
    token: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        to: args.token,
        title: args.title,
        body: args.body,
        data: args.data,
        sound: 'default'
      }])
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Expo API error: ${error}`);
    }

    return await response.json();
  }
});