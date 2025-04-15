// convex/messages.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// convex/example.ts
import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
const pushNotifications = new PushNotifications(components.pushNotifications);

// Send a new message to a chat room
export const sendMessage = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    content: v.string(),
    senderId: v.string(), // User ID or device ID
    senderName: v.string(), // Username
  },
  handler: async (ctx, args) => {
    // Check if the chat room exists
    const chatRoom = await ctx.db.get(args.chatRoomId);
    if (!chatRoom) {
      throw new Error("Chat room not found");
    }

    // Create a new message
    const messageId = await ctx.db.insert("messages", {
      chatRoomId: args.chatRoomId,
      content: args.content,
      sender: args.senderId,
      senderName: args.senderName,
      timestamp: Date.now(),
    });

    return { messageId };
  },
});

export const sendMessage2 = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    content: v.string(),
    senderId: v.string(),
    senderName: v.string()
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      chatRoomId: args.chatRoomId,
      content: args.content,
      sender: args.senderId,
      senderName: args.senderName,
      timestamp: Date.now()
    });

    // Get chat room participants
    const participants = await ctx.db.query("chatRoomMembers")
      .filter(q => q.eq(q.field("chatRoomId"), args.chatRoomId))
      .collect();

    for (const user of participants) {
      if (user.userId !== args.senderId) {
        const userRecord = await ctx.db.query("users")
          .filter(q => q.eq(q.field("_id"), user.userId))
          .first();

        if (userRecord?.pushToken) {
          await pushNotifications.sendPushNotification(ctx, {
            userId: user.userId as Id<"users">,
            notification: {
              title: args.senderName,
              body: args.content,
            },
          });
        }
      }
    }

    return message;
  },
});




// Get messages for a chat room
export const getMessages = query({
  args: {
    chatRoomId: v.id("chatRooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50; // Default limit is 50 messages

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chatRoomId"), args.chatRoomId))
      .order("desc") // Latest messages first
      .take(limit);

    return messages.reverse(); // Return in chronological order
  },
});

// Get real-time messages for a chat room
export const subscribeToMessages = query({
  args: {
    chatRoomId: v.id("chatRooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chatRoomId"), args.chatRoomId))
      .order("desc")
      .take(limit);

    return messages.reverse();
  },
});