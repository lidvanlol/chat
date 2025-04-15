
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new chat room
export const createChatRoom = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatRoomId = await ctx.db.insert("chatRooms", {
      name: args.name,
      createdAt: Date.now(),
      createdBy: args.userId,
      isActive: true,
    });

    // Return the created chat room with its ID
    const chatRoom = await ctx.db.get(chatRoomId);
    
    return {
      ...chatRoom,
      id: chatRoomId,
    };
  },
});


export const checkChatRoomExists = mutation({
    args: {
      chatRoomId: v.id('chatRooms'),
    },
    handler: async (ctx, args) => {
      try {
        const chatRoom = await ctx.db.get(args.chatRoomId);
        return !!chatRoom; // Return true if the chat room exists
      } catch (error) {
        return false; // Return false if there's an error or the chat room doesn't exist
      }
    },
  });
  

// Get chat room details
export const getChatRoom = query({
  args: {
    chatRoomId: v.id("chatRooms"),
  },
  handler: async (ctx, args) => {
    const chatRoom = await ctx.db.get(args.chatRoomId);
    return chatRoom;
  },
});

export const getAllChatRooms = query({
  handler: async (ctx) => {
    const rooms = await ctx.db.query("chatRooms").collect();
    return rooms;
  },
});


// Get all chat rooms for a user
export const getChatRoomsForUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatRooms = await ctx.db
      .query("chatRooms")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .order("desc")
      .collect();
    
    return chatRooms;
  },
});

// convex/chatRooms.ts

export const joinChatRoom = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingMembership = await ctx.db
      .query("chatRoomMembers")
      .filter(q => 
        q.and(
          q.eq(q.field("chatRoomId"), args.chatRoomId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existingMembership) {
      return { alreadyJoined: true };
    }

    await ctx.db.insert("chatRoomMembers", {
      chatRoomId: args.chatRoomId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return { success: true };
  }
});
