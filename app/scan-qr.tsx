import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '../convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

export default function ScanQRScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const checkChatRoom = useMutation(api.chatRooms.checkChatRoomExists);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Extract chatRoomId from the scanned URL
      const urlParts = data.split('/');
      const potentialChatId = urlParts[urlParts.length - 1];

      // Validate the chatRoomId and check if it exists in Convex
      const exists = await checkChatRoom({
        chatRoomId: potentialChatId as Id<'chatRooms'>,
      });

      if (exists) {
        // Navigate to the chat room
        router.push(`/chat/${potentialChatId}`);
      } else {
        Alert.alert("Invalid QR code or chat room doesn't exist");
        setScanned(false);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Failed to process QR code');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.infoText}>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.infoText}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}
        ref={cameraRef}
      />

      <View style={styles.overlay}>
        <View style={styles.unfilled} />
        <View style={styles.scanRow}>
          <View style={styles.unfilled} />
          <View style={styles.scanSquare} />
          <View style={styles.unfilled} />
        </View>
        <View style={styles.unfilled} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan Chat QR Code</Text>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  backButton: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  unfilled: {
    flex: 1,
  },
  scanRow: {
    flexDirection: 'row',
    height: 250,
  },
  scanSquare: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
