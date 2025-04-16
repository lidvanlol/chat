import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from '../convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { ChatRoom } from '../types/models';
import { Id } from '@/convex/_generated/dataModel';
import Header from '@/components/Header';

export default function ChatRoomsScreen() {
  const { user, isLoading } = useUser();

  const chatRooms = useQuery(api.chatRooms.getAllChatRooms); // fetch ALL chat rooms
  const joinChat = useMutation(api.chatRooms.joinChatRoom);
  const myRooms = useQuery(
    api.chatRooms.getChatRoomsForUser,
    user ? { userId: user.userId } : 'skip',
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const isUserInRoom = (chatRoomId: string) => {
    return myRooms?.some(room => room._id === chatRoomId);
  };

  const handleJoin = async (chatRoomId: string, name: string) => {
    if (!user) return;
    try {
      const res = await joinChat({
        chatRoomId: chatRoomId as Id<'chatRooms'>,
        userId: user.userId,
      });

      if (res?.alreadyJoined) {
        console.log('User is already a member');
      }
      router.push({ pathname: '/chat/[id]', params: { id: chatRoomId, name } });
    } catch (err) {
      console.error('Failed to join', err);
    }
  };

  const renderChatRoom = React.useCallback(
    ({ item }: { item: ChatRoom }) => {
      const joined = isUserInRoom(item._id);
      return (
        <TouchableOpacity
          style={styles.chatRoomItem}
          onPress={() =>
            joined
              ? router.push({
                  pathname: '/chat/[id]',
                  params: { id: item._id, name: item.name },
                })
              : handleJoin(item._id, item.name)
          }
        >
          <View style={styles.chatRoomHeader}>
            <Text style={styles.chatRoomName} numberOfLines={1}>
              {item.name}
            </Text>
            <Ionicons name={joined ? 'chevron-forward' : 'log-in-outline'} size={20} color="#888" />
          </View>
          <Text style={styles.chatRoomDate}>
            Created on {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      );
    },
    [myRooms, isUserInRoom, handleJoin, router],
  );

  if (isLoading || !user || !chatRooms) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Chat Rooms"
        showLeftIcon={true}
        leftIcon="add"
        showRightIcon={true}
        rightIcon="qr-code"
        onRightPress={() => router.push('/scan-qr')}
        onLeftPress={() => router.push('/create-chat')}
      />

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={11}
        refreshing={refreshing}
        onRefresh={onRefresh}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chat rooms available</Text>
            <Text style={styles.emptySubText}>Create one to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    backgroundColor: '#f5f5f5',
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
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
    backgroundColor: 'red',
  },
  chatRoomItem: {
    backgroundColor: '#fff', // Better contrast
    padding: 16,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatRoomName: {
    fontSize: 16,
    fontFamily: 'Roboto-SemiBold',
    flex: 1, // Takes available space
    marginRight: 10, // Prevents text from touching icon
  },
  chatRoomDate: {
    color: '#666',
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-SemiBold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
    fontFamily: 'Roboto-Regular',
  },
  createButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    position: 'absolute',
    bottom: 30,
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
    fontFamily: 'Roboto-SemiBold',
    fontSize: 16,
    marginLeft: 5,
  },
});
