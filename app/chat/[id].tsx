import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '../../convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { Message } from '@/types/models';
import { Id } from '../../convex/_generated/dataModel';
import ShareQRCode from '@/components/ShareQrCode';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageItem } from '@/components/MessageItem';

import Header from '@/components/Header';
export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams();
  const [message, setMessage] = useState<string>('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const { user, isLoading: userLoading } = useUser();

  const [showQRCode, setShowQRCode] = useState(false);
  const [chatName, setChatName] = useState((name as string) || 'Chat Room');

  // Add this query to get chat room details if name isn't provided
  const chatRoom = useQuery(
    api.chatRooms.getChatRoom,
    id ? { chatRoomId: id as Id<'chatRooms'> } : 'skip',
  );

  useEffect(() => {
    if (!name && chatRoom?.name) {
      setChatName(chatRoom.name);
    }
  }, [name, chatRoom]);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const currentUserId = user?.userId;
  // Get messages from Convex
  const messages = useQuery(api.messages.subscribeToMessages, {
    chatRoomId: id as Id<'chatRooms'>,
    limit: 100,
  });
  const notificationState = useRef({
    lastMessageId: null as string | null,
    initialLoadComplete: false,
    lastNotificationTime: 0,
  });
  // Send message mutation
  const sendMessage = useMutation(api.messages.sendMessage);

  const renderItem = React.useCallback(
    ({ item }: { item: Message }) => <MessageItem item={item} currentUserId={user?.userId || ''} />,
    [user?.userId],
  );

  // Memoize key extractor
  const keyExtractor = React.useCallback((item: Message) => item._id, []);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 120;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      notificationState.current.initialLoadComplete = true;
      return;
    }

    const lastMessage = messages[messages.length - 1];

    // Skip initial load
    if (!notificationState.current.initialLoadComplete) {
      notificationState.current.lastMessageId = lastMessage._id;
      notificationState.current.initialLoadComplete = true;
      return;
    }

    // Skip if same message or not from others
    if (
      lastMessage._id === notificationState.current.lastMessageId ||
      lastMessage.sender === currentUserId
    ) {
      return;
    }

    // Skip if not new enough
    const now = Date.now();
    if (lastMessage.timestamp <= notificationState.current.lastNotificationTime) {
      return;
    }

    // Show notification
    Notifications.scheduleNotificationAsync({
      content: {
        title: `New message from ${lastMessage.senderName}`,
        body: lastMessage.content,
        data: { chatRoomId: lastMessage.chatRoomId },
      },
      trigger: null,
    });

    // Update state
    notificationState.current = {
      lastMessageId: lastMessage._id,
      initialLoadComplete: true,
      lastNotificationTime: now,
    };
  }, [messages, currentUserId]); // Only depends on these

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      // Send the message first
      await sendMessage({
        chatRoomId: id as Id<'chatRooms'>,
        content: message.trim(),
        senderId: user.userId,
        senderName: user.username,
      });

      // Clear input and scroll
      setMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Failed to send message');
    }
  };

  // Show loading state if user is not yet available
  if (userLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Initializing chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={chatName}
        leftIcon="arrow-back"
        rightIcon="qr-code-outline"
        onLeftPress={() => router.back()}
        onRightPress={() => setShowQRCode(true)}
        leftIconColor="#000"
        rightIconColor="#2196F3"
        showLeftIcon={true}
        showRightIcon={true}
      />
      <ShareQRCode
        chatRoomId={id as Id<'chatRooms'>}
        chatName={name as string}
        modalVisible={showQRCode}
        onClose={() => setShowQRCode(false)}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          {messages ? (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              ListEmptyComponent={
                <Text style={styles.emptyChat}>
                  No messages yet. Be the first to send a message!
                </Text>
              }
              onContentSizeChange={scrollToBottom}
              onScroll={handleScroll}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={21}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={50}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text>Loading messages...</Text>
            </View>
          )}
        </View>
        {showScrollButton && (
          <TouchableOpacity
            style={styles.scrollToBottomButton}
            onPress={scrollToBottom}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-down" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            testID="send"
          >
            <Ionicons name="send" size={24} color={message.trim() ? 'white' : '#B3D4FF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 100, // Position above the input field
    alignSelf: 'center', // Center horizontally
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1,
  },
  messagesList: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emptyChat: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#e5e5e5',
    borderBottomLeftRadius: 5,
  },
  messageSender: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#000',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',

    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#111',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100, // Limit how tall the input can get
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sendButtonDisabled: {
    backgroundColor: '#B3DEFF',
    elevation: 0,
    shadowOpacity: 0,
  },
});
