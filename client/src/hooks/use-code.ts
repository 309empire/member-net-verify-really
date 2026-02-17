import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Create a client-side type based on the Zod schema since it's defined in the routes manifest
type CodeResponse = z.infer<typeof api.getCode.responses[200]>;

export function useCode() {
  return useQuery({
    queryKey: [api.getCode.path],
    queryFn: async () => {
      const res = await fetch(api.getCode.path);
      
      if (res.status === 503) {
        throw new Error("Service unavailable. Please try again later.");
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch verification code");
      }

      const data = await res.json();
      // Validate with Zod schema from shared routes
      return api.getCode.responses[200].parse(data);
    },
    // Don't refetch automatically to prevent code changing while user is reading it
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
