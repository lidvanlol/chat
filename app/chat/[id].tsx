// app/chat/[id].tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '../../convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { Message } from '@/types/models';
import { Id } from '../../convex/_generated/dataModel';
import ShareQRCode from '@/components/ShareQrCode';

interface ChatRoomParams {
  id: Id<"chatRooms">;
  name: string;
}

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams();
  const [message, setMessage] = useState<string>('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const { user, isLoading: userLoading } = useUser();
  
  // Get messages from Convex
  const messages = useQuery(api.messages.subscribeToMessages, { 
    chatRoomId: id as Id<"chatRooms">,
    limit: 100
  });
  
  // Send message mutation
  const sendMessage = useMutation(api.messages.sendMessage);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    try {
      await sendMessage({
        chatRoomId: id as Id<"chatRooms">,
        content: message.trim(),
        senderId: user.userId,
        senderName: user.username,
      });
      
      setMessage(''); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = user && item.sender === user.userId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.messageSender}>{item.senderName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
         <ShareQRCode chatRoomId={id as Id<"chatRooms">} chatName={name as string} />
      <View style={styles.chatContainer}>
        {messages ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <Text style={styles.emptyChat}>
                No messages yet. Be the first to send a message!
              </Text>
            }
            onLayout={() => {
              if (messages.length > 0 && flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text>Loading messages...</Text>
          </View>
        )}
      </View>
      
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
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() ? "white" : "#B3D4FF"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    backgroundColor: 'white',
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
   
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    paddingBottom:40,
    paddingTop:20,
    paddingHorizontal:20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
  }
})