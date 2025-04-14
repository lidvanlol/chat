// app/index.tsx
import React,{useEffect} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '../convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { ChatRoom } from '../types/models';

export default function ChatRoomsScreen() {
  const { user, isLoading } = useUser();
  
  

  
  const renderHeaderRight = () => (
    <View style={styles.headerButtons}>
      <TouchableOpacity 
        onPress={() => router.push('/scan-qr')}
        style={styles.headerButton}
      >
        <Ionicons name="scan-outline" size={24} color="#2196F3" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => router.push('/create-chat')}
        style={styles.headerButton}
      >
        <Ionicons name="add" size={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );



  // Fetch chat rooms from Convex
  const chatRooms = useQuery(
    api.chatRooms.getChatRoomsForUser, 
    user ? { userId: user.userId } : "skip" // Skip query if userId is not yet available
  );

  const navigateToChatRoom = (id: string, name: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name }
    });
  };

  const navigateToCreateChat = () => {
    router.push('/create-chat');
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoomItem}
      onPress={() => navigateToChatRoom(item._id, item.name)}
    >
      <View style={styles.chatRoomHeader}>
        <Text style={styles.chatRoomName}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </View>
      <Text style={styles.chatRoomDate}>
        Created on {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading || !user) {
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
      <TouchableOpacity 
        onPress={() => router.push('/scan-qr')}
        style={styles.headerButton}
      >
        <Text>Scan Qr</Text>
      </TouchableOpacity>
      {chatRooms ? (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No chat rooms found</Text>
              <Text style={styles.emptySubText}>Create your first chat room</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
          <Text>Loading chat rooms...</Text>
        </View>
      )}
     


      <TouchableOpacity 
        style={styles.createButton}
        onPress={navigateToCreateChat}
      >
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