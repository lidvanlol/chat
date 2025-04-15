import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Share,
  Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Id } from "@/convex/_generated/dataModel";

interface ShareQRCodeProps {
  chatRoomId: Id<"chatRooms">;
  chatName: string;
}

export default function ShareQRCode({
  chatRoomId,
  chatName,
}: ShareQRCodeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Create the deep link URL - update with your actual app URL scheme
  const appDomain = "your-app-name.com"; // For web links
  const appScheme = "chat"; // For mobile deep links
  const deepLink =
    Platform.OS === "web"
      ? `https://${appDomain}/chat/${chatRoomId}`
      : `${appScheme}chat/${chatRoomId}`;

  return (
    <>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="qr-code-outline" size={24} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share {chatName}</Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={deepLink}
                size={200}
                color="black"
                backgroundColor="white"
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#666",
    fontSize: 20,
  },
});
