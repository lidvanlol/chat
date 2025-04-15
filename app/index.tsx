
import React,{useEffect} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery,useMutation } from '../convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { ChatRoom } from '../types/models';
import { Id } from '@/convex/_generated/dataModel';
export default function ChatRoomsScreen() {
  const { user, isLoading } = useUser();
  const chatRooms = useQuery(api.chatRooms.getAllChatRooms); // fetch ALL chat rooms
  const joinChat = useMutation(api.chatRooms.joinChatRoom);
  const myRooms = useQuery(
    api.chatRooms.getChatRoomsForUser,
    user ? { userId: user.userId } : "skip"
  );

  const isUserInRoom = (chatRoomId: string) => {
    return myRooms?.some((room) => room._id === chatRoomId);
  };

  const handleJoin = async (chatRoomId: string, name: string) => {
    if (!user) return;
    try {
      const res = await joinChat({
        chatRoomId: chatRoomId as Id<"chatRooms">,
        userId: user.userId,
      });
      
      if (res?.alreadyJoined) {
        console.log('User is already a member');
      }
      router.push({ pathname: '/chat/[id]', params: { id: chatRoomId, name } });
    } catch (err) {
      console.error("Failed to join", err);
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const joined = isUserInRoom(item._id);
    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() =>
          joined ? router.push({ pathname: '/chat/[id]', params: { id: item._id, name: item.name } }) :
          handleJoin(item._id, item.name)
        }
      >
        <View style={styles.chatRoomHeader}>
          <Text style={styles.chatRoomName}>{item.name}</Text>
          <Ionicons name={joined ? "chevron-forward" : "log-in-outline"} size={20} color="#888" />
        </View>
        <Text style={styles.chatRoomDate}>
          Created on {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading || !user || !chatRooms) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Rooms</Text>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/create-chat')}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Create New Chat Room</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
    backgroundColor:"red",

  },
  chatRoomItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRoomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatRoomDate: {
    color: '#666',
    marginTop: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  createButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});