
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '../convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';

export default function CreateChatScreen() {
  const [chatName, setChatName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { user, isLoading } = useUser();

  // Create chat room mutation
  const createChatRoom = useMutation(api.chatRooms.createChatRoom);
  const joinChatRoom = useMutation(api.chatRooms.joinChatRoom);

  const handleCreateChat = async () => {
    if (!chatName.trim() || !user) return;
  
    setIsCreating(true);
    try {
      const newChatRoom = await createChatRoom({
        name: chatName.trim(),
        userId: user.userId,
      });
  
      await joinChatRoom({
        chatRoomId: newChatRoom.id,
        userId: user.userId,
      });
  
      router.push({
        pathname: '/chat/[id]',
        params: { id: newChatRoom.id, name: newChatRoom.name },
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to create chat room');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#2196F3" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Create New Chat Room</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Chat Room Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter chat room name"
          value={chatName}
          onChangeText={setChatName}
          autoFocus
        />
        
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!chatName.trim() || isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreateChat}
          disabled={!chatName.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Chat Room</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#A4CFFF',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
});