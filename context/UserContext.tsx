import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { User } from '@/types/models';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUsername: (username: string) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  setUsername: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        // Try to get user ID and username from AsyncStorage
        let storedUserId = await AsyncStorage.getItem('userId');
        let storedUsername = await AsyncStorage.getItem('username');
        
        // If user ID doesn't exist, create one based on device info
        if (!storedUserId) {
          storedUserId = `user_${Device.deviceName || 'unknown'}_${Date.now()}`;
          await AsyncStorage.setItem('userId', storedUserId);
        }
        
        // If username doesn't exist, create a default one
        if (!storedUsername) {
          storedUsername = `User_${Math.floor(Math.random() * 10000)}`;
          await AsyncStorage.setItem('username', storedUsername);
        }
        
        setUser({
          userId: storedUserId,
          username: storedUsername
        });
      } catch (error) {
        console.error('Error initializing user:', error);
        // Fallback values
        setUser({
          userId: `anonymous_${Date.now()}`,
          username: 'Anonymous'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initUser();
  }, []);

  const setUsername = async (username: string): Promise<void> => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem('username', username);
      setUser({
        ...user,
        username
      });
    } catch (error) {
      console.error('Error setting username:', error);
      throw new Error('Failed to save username');
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};