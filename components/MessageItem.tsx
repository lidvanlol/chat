import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "@/types/models";

export const MessageItem = React.memo(
  ({ item, currentUserId }: { item: Message; currentUserId: string }) => {
    const isOwnMessage = item.sender === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isOwnMessage && (
            <Text style={styles.messageSender}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  }
);

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
    padding: 20,
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
