import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Id } from '@/convex/_generated/dataModel';

interface ShareQRCodeProps {
  chatRoomId: Id<'chatRooms'>;
  chatName: string;
  modalVisible: boolean;
  onClose: () => void;
}

export default function ShareQRCode({
  chatRoomId,
  chatName,
  modalVisible,
  onClose,
}: ShareQRCodeProps) {
  const appDomain = 'your-app-name.com';
  const appScheme = 'chat';
  const deepLink =
    Platform.OS === 'web'
      ? `https://${appDomain}/chat/${chatRoomId}`
      : `${appScheme}chat/${chatRoomId}`;

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share {chatName}</Text>

            <View style={styles.qrContainer}>
              <QRCode value={deepLink} size={200} color="black" backgroundColor="white" />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose} // Use the onClose prop instead
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
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
    fontFamily: 'Roboto-Bold',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 20,
    fontFamily: 'Roboto-SemiBold',
  },
});
