import { ConvexReactClient } from "convex/react";

// Initialize the Convex client with your deployment URL from environment variable
const convexUrl = "https://helpful-albatross-575.convex.cloud"

if (!convexUrl) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is not defined");
}

export const convex = new ConvexReactClient(convexUrl);

export { useQuery, useMutation, useConvex } from "convex/react";