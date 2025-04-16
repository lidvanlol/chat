// __tests__/CreateChatScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import CreateChatScreen from '@/app/create-chat'; // Adjust the import path as needed
import { useUser } from '@/context/UserContext';

// Mock the dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock the api without referencing the actual api object
jest.mock('../convex/_generated/api', () => ({
  api: {
    chatRooms: {
      createChatRoom: 'mock-create-chat-room',
      joinChatRoom: 'mock-join-chat-room',
    },
  },
}));

// Mock the useMutation hook
jest.mock('../convex/react', () => ({
  useMutation: jest.fn(mutationFn => {
    if (mutationFn === 'mock-create-chat-room') {
      return jest.fn().mockResolvedValue({ id: 'mock-chat-id', name: 'Test Chat' });
    }
    if (mutationFn === 'mock-join-chat-room') {
      return jest.fn().mockResolvedValue({ success: true });
    }
    return jest.fn();
  }),
}));

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CreateChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { userId: 'test-user-id' },
      isLoading: false,
    });
  });

  it('renders loading state when user data is loading', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });

    const { getByText } = render(<CreateChatScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders form when user is logged in', () => {
    const { getByText, getByPlaceholderText } = render(<CreateChatScreen />);

    expect(getByText('Create New Chat Room')).toBeTruthy();
    expect(getByText('Chat Room Name')).toBeTruthy();
    expect(getByPlaceholderText('Enter chat room name')).toBeTruthy();
    expect(getByText('Create Chat Room')).toBeTruthy();
  });

  it('updates chat name when input changes', () => {
    const { getByPlaceholderText } = render(<CreateChatScreen />);
    const input = getByPlaceholderText('Enter chat room name');

    fireEvent.changeText(input, 'New Test Chat');

    expect(input.props.value).toBe('New Test Chat');
  });

  it('disables create button when chat name is empty', () => {
    const { getByTestId } = render(<CreateChatScreen />);

    expect(getByTestId('create-button').props.accessibilityState?.disabled).toBe(true);
  });

  it('enables create button when chat name is not empty', () => {
    const { getByPlaceholderText, getByTestId } = render(<CreateChatScreen />);
    const input = getByPlaceholderText('Enter chat room name');
    fireEvent.changeText(input, 'New Test Chat');

    const createButton = getByTestId('create-button');
    expect(createButton.props.accessibilityState?.disabled).toBe(false);
  });

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<CreateChatScreen />);
    fireEvent.press(getByTestId('back-button'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('creates a chat room and navigates to it when create button is pressed', async () => {
    const { getByPlaceholderText, getByTestId } = render(<CreateChatScreen />);

    const input = getByPlaceholderText('Enter chat room name');
    fireEvent.changeText(input, 'Test Chat Room');

    const createButton = getByTestId('create-button');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/chat/[id]',
        params: { id: 'mock-chat-id', name: 'Test Chat' },
      });
    });
  });
});
