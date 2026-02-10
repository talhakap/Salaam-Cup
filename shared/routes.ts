import { z } from 'zod';
import { 
  insertUserSchema, 
  insertTournamentSchema, 
  insertDivisionSchema, 
  insertTeamSchema, 
  insertPlayerSchema, 
  insertMatchSchema,
  insertVenueSchema,
  teams,
  players,
  tournaments,
  divisions,
  matches,
  venues
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === PUBLIC & ADMIN: Tournaments ===
  tournaments: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments' as const,
      responses: {
        200: z.array(z.custom<typeof tournaments.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tournaments/:id' as const,
      responses: {
        200: z.custom<typeof tournaments.$inferSelect & { divisions: typeof divisions.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tournaments' as const,
      input: insertTournamentSchema,
      responses: {
        201: z.custom<typeof tournaments.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === PUBLIC & ADMIN: Divisions ===
  divisions: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments/:tournamentId/divisions' as const,
      responses: {
        200: z.array(z.custom<typeof divisions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/divisions' as const,
      input: insertDivisionSchema,
      responses: {
        201: z.custom<typeof divisions.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === TEAMS (Public list, Captain create, Admin approve) ===
  teams: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments/:tournamentId/teams' as const,
      input: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        divisionId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof teams.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/teams/:id' as const,
      responses: {
        200: z.custom<typeof teams.$inferSelect & { players?: typeof players.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/teams' as const,
      input: insertTeamSchema,
      responses: {
        201: z.custom<typeof teams.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/teams/:id' as const,
      input: insertTeamSchema.partial(),
      responses: {
        200: z.custom<typeof teams.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === PLAYERS (Captain manage, Admin verify) ===
  players: {
    list: {
      method: 'GET' as const,
      path: '/api/teams/:teamId/players' as const,
      responses: {
        200: z.array(z.custom<typeof players.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/players' as const,
      input: insertPlayerSchema,
      responses: {
        201: z.custom<typeof players.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/players/:id' as const,
      input: insertPlayerSchema.partial(),
      responses: {
        200: z.custom<typeof players.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/teams/:teamId/players/bulk' as const,
      input: z.array(insertPlayerSchema.omit({ teamId: true })),
      responses: {
        201: z.array(z.custom<typeof players.$inferSelect>()),
      },
    },
  },

  // === MATCHES & STANDINGS ===
  matches: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments/:tournamentId/matches' as const,
      responses: {
        200: z.array(z.custom<typeof matches.$inferSelect & { homeTeam: typeof teams.$inferSelect, awayTeam: typeof teams.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/matches' as const,
      input: insertMatchSchema,
      responses: {
        201: z.custom<typeof matches.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/matches/:id' as const,
      input: insertMatchSchema.partial(),
      responses: {
        200: z.custom<typeof matches.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
  },
  
  venues: {
     list: {
        method: 'GET' as const,
        path: '/api/venues' as const,
        responses: {
           200: z.array(z.custom<typeof venues.$inferSelect>()),
        }
     },
     create: {
        method: 'POST' as const,
        path: '/api/venues' as const,
        input: insertVenueSchema,
        responses: {
           201: z.custom<typeof venues.$inferSelect>(),
           403: errorSchemas.forbidden
        }
     }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
