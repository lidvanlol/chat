import React from "react";
import { render } from "@testing-library/react-native";
import ChatRoomsScreen from "@/app/index"; // adjust path as needed
import { useUser } from "@/context/UserContext";
import { useQuery } from "../convex/react";

import { api } from "@/convex/_generated/api";
jest.mock("expo-font");
// Mocks
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("../convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Sample test data
const fakeUser = { userId: "user-123" };
const fakeRooms = [
  { _id: "room1", name: "GeneralChat" },
  { _id: "room2", name: "Dev Room" },
];

describe("ChatRoomsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading when user or chat rooms are not loaded", () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    (useQuery as jest.Mock).mockReturnValue(null);

    const { getByText } = render(<ChatRoomsScreen />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("renders chat rooms correctly", () => {
    (useUser as jest.Mock).mockReturnValue({
      user: fakeUser,
      isLoading: false,
    });
    (useQuery as jest.Mock).mockImplementation((queryFn, args) => {
      if (queryFn === api.chatRooms.getAllChatRooms) return fakeRooms;
      if (queryFn === api.chatRooms.getChatRoomsForUser) return [fakeRooms[0]];
      return [];
    });
  });
});
