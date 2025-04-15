import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chatRooms: defineTable({
    name: v.string(),
    createdAt: v.number(),
    createdBy: v.string(), // user ID
    isActive: v.boolean(),
  }).index("byCreatedAt", ["createdAt"]),

  messages: defineTable({
    chatRoomId: v.id("chatRooms"),
    content: v.string(),
    sender: v.string(), // user ID or device ID
    senderName: v.string(), // username
    timestamp: v.number(),
  }).index("byChatRoom", ["chatRoomId"]),

  chatRoomMembers: defineTable({
    chatRoomId: v.id("chatRooms"),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("byUser", ["userId"])
    .index("byChatRoom", ["chatRoomId"]),
    users: defineTable(
      v.object({
        name: v.string(),
        pushToken: v.optional(v.string())
      })
    ).index("by_name", ["name"]),
});
