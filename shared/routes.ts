import { z } from 'zod';

// Simple API contract
export const api = {
  // Frontend calls this to get a fresh code
  getCode: {
    method: 'GET' as const,
    path: '/api/code' as const,
    responses: {
      200: z.object({
        code: z.string(),
        expiresIn: z.number(),
        expiresAt: z.number(),
      }),
      503: z.object({ message: z.string() }), // Service unavailable
    },
  },
  // Bot calls this internally, but we define validation here
  verify: {
    input: z.object({
      code: z.string().length(11), // format XXX-XXX-XXX is 11 chars
      discordId: z.string(),
    }),
  }
};
