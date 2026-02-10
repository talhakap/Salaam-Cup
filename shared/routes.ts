import { z } from 'zod';
import { 
  insertTournamentSchema, 
  insertDivisionSchema, 
  insertTeamSchema, 
  insertPlayerSchema, 
  insertMatchSchema,
  insertVenueSchema,
  insertStandingSchema,
  insertSportSchema,
  teams,
  players,
  tournaments,
  divisions,
  matches,
  venues,
  standings,
  sports,
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
  // === SPORTS ===
  sports: {
    list: {
      method: 'GET' as const,
      path: '/api/sports' as const,
      responses: {
        200: z.array(z.custom<typeof sports.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sports' as const,
      input: insertSportSchema,
      responses: {
        201: z.custom<typeof sports.$inferSelect>(),
      },
    },
  },

  // === TOURNAMENTS ===
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
        200: z.custom<typeof tournaments.$inferSelect & { divisions: (typeof divisions.$inferSelect)[] }>(),
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

  // === TOURNAMENTS (update/delete) ===
  tournamentUpdate: {
    method: 'PATCH' as const,
    path: '/api/tournaments/:id' as const,
    input: insertTournamentSchema.partial(),
    responses: {
      200: z.custom<typeof tournaments.$inferSelect>(),
      403: errorSchemas.forbidden,
    },
  },
  tournamentDelete: {
    method: 'DELETE' as const,
    path: '/api/tournaments/:id' as const,
    responses: {
      200: z.object({ message: z.string() }),
      403: errorSchemas.forbidden,
    },
  },

  // === DIVISIONS ===
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
    update: {
      method: 'PATCH' as const,
      path: '/api/divisions/:id' as const,
      input: insertDivisionSchema.partial(),
      responses: {
        200: z.custom<typeof divisions.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/divisions/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === TEAMS ===
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
        200: z.custom<typeof teams.$inferSelect & { players?: (typeof players.$inferSelect)[] }>(),
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
    delete: {
      method: 'DELETE' as const,
      path: '/api/teams/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === MY TEAMS (captain) ===
  myTeams: {
    list: {
      method: 'GET' as const,
      path: '/api/my-teams' as const,
      responses: {
        200: z.array(z.custom<typeof teams.$inferSelect>()),
        401: errorSchemas.forbidden,
      },
    },
  },

  // === ALL TEAMS (admin) ===
  allTeams: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/teams' as const,
      input: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof teams.$inferSelect>()),
      },
    },
  },

  // === PLAYERS ===
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
    register: {
      method: 'POST' as const,
      path: '/api/players/register' as const,
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
    delete: {
      method: 'DELETE' as const,
      path: '/api/players/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
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

  // === ADMIN PLAYERS ===
  adminPlayers: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/players' as const,
      responses: {
        200: z.array(z.custom<typeof players.$inferSelect & { team: typeof teams.$inferSelect | null }>()),
      },
    },
  },

  // === MATCHES ===
  matches: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments/:tournamentId/matches' as const,
      responses: {
        200: z.array(z.custom<typeof matches.$inferSelect & { homeTeam: typeof teams.$inferSelect | null, awayTeam: typeof teams.$inferSelect | null }>()),
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
    delete: {
      method: 'DELETE' as const,
      path: '/api/matches/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        403: errorSchemas.forbidden,
      },
    },
  },

  // === STANDINGS ===
  standings: {
    list: {
      method: 'GET' as const,
      path: '/api/tournaments/:tournamentId/standings' as const,
      responses: {
        200: z.array(z.custom<typeof standings.$inferSelect & { team: typeof teams.$inferSelect }>()),
      },
    },
    recalculate: {
      method: 'POST' as const,
      path: '/api/tournaments/:tournamentId/standings/recalculate' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },

  // === VENUES ===
  venues: {
    list: {
      method: 'GET' as const,
      path: '/api/venues' as const,
      responses: {
        200: z.array(z.custom<typeof venues.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/venues' as const,
      input: insertVenueSchema,
      responses: {
        201: z.custom<typeof venues.$inferSelect>(),
        403: errorSchemas.forbidden,
      },
    },
  },
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
