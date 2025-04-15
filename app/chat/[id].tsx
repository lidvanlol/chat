import React, { useState, useRef, useEffect,useCallback } from "react";
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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "../../convex/react";
import { api } from "../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { Message } from "@/types/models";
import { Id } from "../../convex/_generated/dataModel";
import ShareQRCode from "@/components/ShareQrCode";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageItem } from "@/components/MessageItem";
export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams();
  const [message, setMessage] = useState<string>("");
  const flatListRef = useRef<FlatList<Message>>(null);
  const { user, isLoading: userLoading } = useUser();
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const currentUserId = user?.userId;
  // Get messages from Convex
  const messages = useQuery(api.messages.subscribeToMessages, {
    chatRoomId: id as Id<"chatRooms">,
    limit: 100,
  });

  // Send message mutation
  const sendMessage = useMutation(api.example.sendMessage);
  const sendMessage2 = useMutation(api.messages.sendMessage2);

  
  const renderItem = React.useCallback(
    ({ item }: { item: Message }) => (
      <MessageItem item={item} currentUserId={user?.userId || ""} />
    ),
    [user?.userId]
  );

  // Memoize key extractor
  const keyExtractor = React.useCallback((item: Message) => item._id, []);




 
 

  // useEffect(() => {
  //   if (!messages || messages.length === 0) return;

  //   const lastMessage = messages[messages.length - 1];

  //   // Only notify if:
  //   // 1. Message is from someone else
  //   // 2. Message is new (timestamp > lastNotificationTime)
  //   if (
  //     lastMessage.sender !== currentUserId &&
  //     lastMessage.timestamp > lastNotificationTime
  //   ) {
  //     Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: `New message from ${lastMessage.senderName}`,
  //         body: lastMessage.content,
  //         data: { chatRoomId: lastMessage.chatRoomId },
  //       },
  //       trigger: null,
  //     });

  //     // Update the last notification time
  //     setLastNotificationTime(Date.now());
  //   }
  // }, [messages]); // Only runs when messages change

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      await sendMessage({
        chatRoomId: id as Id<"chatRooms">,
        content: message.trim(),
        senderId: user.userId,
        senderName: user.username,
      });

      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
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

  const CustomHeader = () => (
    <View style={headerStyles.container}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={headerStyles.iconContainer}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title} numberOfLines={1}>
          {name as string}
        </Text>
      </View>

      {/* QR Code */}
      <View style={headerStyles.iconContainer}>
        <ShareQRCode
          chatRoomId={id as Id<"chatRooms">}
          chatName={name as string}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
          onLayout={() => {
            if (messages.length > 0 && flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
          // Add these performance optimizations:
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={21} // ~7 screens (3x viewport)
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            testID="send"
          >
            <Ionicons
              name="send"
              size={24}
              color={message.trim() ? "white" : "#B3D4FF"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  emptyChat: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontStyle: "italic",
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: "row",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: "#e5e5e5",
    borderBottomLeftRadius: 5,
  },
  messageSender: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: "#000",
  },
  otherMessageText: {
    color: "#000",
  },
  messageTime: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: "row",

    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    padding:20,
   
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100, // Limit how tall the input can get
  },
  sendButton: {
    backgroundColor: "#2196F3",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  sendButtonDisabled: {
    backgroundColor: "#B3DEFF",
    elevation: 0,
    shadowOpacity: 0,
  },
});
