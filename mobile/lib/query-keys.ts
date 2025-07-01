export const queryKeys = {
  auth: {
    session: ['auth', 'session'],
    user: ['auth', 'user'],
  },
  rooms: {
    all: ['rooms'],
    byId: (id: string) => ['rooms', id],
    members: (roomId: string) => ['rooms', roomId, 'members'],
  },
  users: {
    search: (email: string) => ['users', 'search', email],
  },
  notes: {
    all: ['notes'],
    byRoomId: (roomId: string) => ['notes', 'room', roomId],
    byId: (id: string) => ['notes', id],
  },
  images: {
    byNoteId: (roomId: string, noteId: string) => ['images', roomId, noteId],
  },
  invitations: {
    byRoomId: (roomId: string) => ['invitations', 'room', roomId],
    byEmail: (email: string) => ['invitations', 'email', email],
  },
};
