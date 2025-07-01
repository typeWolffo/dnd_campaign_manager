import { createQueryKeyStore } from "@lukemorales/query-key-factory";

export const queryKeys = createQueryKeyStore({
  auth: {
    session: null,
    user: null,
    apiTokens: null,
  },
  rooms: {
    all: null,
    byId: (id: string) => [id],
    members: (roomId: string) => [roomId],
  },
  users: {
    search: (email: string) => [email],
  },
  notes: {
    all: null,
    byRoomId: (roomId: string) => [roomId],
    byId: (id: string) => [id],
  },
  images: {
    byNoteId: (roomId: string, noteId: string) => [roomId, noteId],
  },
  invitations: {
    byRoomId: (roomId: string) => [roomId],
    byEmail: (email: string) => [email],
  },
});
