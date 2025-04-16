import React from 'react';
import { render } from '@testing-library/react-native';
import ChatRoomScreen from '@/app/chat/[id]'; // Adjust path to your screen
import { useUser } from '@/context/UserContext';
import { useQuery } from '@/convex/react';

jest.mock('expo-font');
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'room1', name: 'Test Room' }),
}));

jest.mock('@/components/ShareQrCode', () => () => null); // mock QR code

describe('ChatRoomScreen', () => {
  const fakeUser = {
    userId: 'user_123',
    username: 'TestUser',
  };

  const fakeMessages = [
    {
      _id: 'msg_1',
      content: 'Hello there!',
      sender: 'user_123',
      senderName: 'TestUser',
      timestamp: new Date().toISOString(),
    },
    {
      _id: 'msg_2',
      content: 'Hi!',
      sender: 'user_456',
      senderName: 'OtherUser',
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useUser as jest.Mock).mockReturnValue({
      user: fakeUser,
      isLoading: false,
    });
  });

  it('shows loading spinner when user is loading', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });

    const { getByText } = render(<ChatRoomScreen />);
    expect(getByText('Initializing chat...')).toBeTruthy();
  });

  it('shows empty message when there are no messages', () => {
    (useQuery as jest.Mock).mockReturnValue([]);

    const { getByText } = render(<ChatRoomScreen />);
    expect(getByText('No messages yet. Be the first to send a message!')).toBeTruthy();
  });

  it('renders messages when available', () => {
    (useQuery as jest.Mock).mockReturnValue(fakeMessages);

    const { getByText } = render(<ChatRoomScreen />);
    expect(getByText('Hello there!')).toBeTruthy();
    expect(getByText('Hi!')).toBeTruthy();

    expect(getByText('OtherUser')).not.toBeNull();
  });
});
