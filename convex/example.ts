import { mutation, action, query } from "./_generated/server";
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    content: v.string(),
    senderId: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      chatRoomId: args.chatRoomId,
      content: args.content,
      sender: args.senderId,
      senderName: args.senderName,
      timestamp: Date.now(),
    });

    try {
      // Get chat room details
      const chatRoom = await ctx.db.get(args.chatRoomId);
      if (!chatRoom) {
        throw new Error("Chat room not found");
      }

      // Get all participants except sender
      const participants = await ctx.db
        .query("chatRoomMembers")
        .withIndex("byChatRoom", (q) => q.eq("chatRoomId", args.chatRoomId))
        .filter((q) => q.neq(q.field("userId"), args.senderId))
        .collect();

      // Send push notifications for each participant
      for (const participant of participants) {
        // Get the user record to find their push token
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), participant.userId))
          .first();

        if (user && "pushToken" in user && user.pushToken) {
          try {
            // Use the new Expo HTTP API integration
            await ctx.scheduler.runAfter(0, internal.functions.push.sendExpoNotification, {
                token: user.pushToken,
                title: `${args.senderName} in ${chatRoom.name || "Chat"}`,
                body: args.content,
                data: {
                  type: "new_message",
                  chatRoomId: args.chatRoomId,
                  messageId: messageId
                }
              });

            console.log(
              `Notification scheduled for user ${participant.userId}`
            );
          } catch (notifError) {
            console.error(`Error scheduling notification: ${notifError}`);
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the message sending
      console.error("Error in notification process:", error);
    }

    return messageId;
  },
});

