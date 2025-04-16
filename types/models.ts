import { Id } from '../convex/_generated/dataModel';

export interface ChatRoom {
  _id: Id<'chatRooms'>;
  name: string;
  createdAt: number;
  createdBy: string;
  isActive: boolean;
}

export interface Message {
  _id: Id<'messages'>;
  chatRoomId: Id<'chatRooms'>;
  content: string;
  sender: string;
  senderName: string;
  timestamp: number;
}

export interface User {
  userId: string;
  username: string;
}
