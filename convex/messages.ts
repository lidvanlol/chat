// convex/messages.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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