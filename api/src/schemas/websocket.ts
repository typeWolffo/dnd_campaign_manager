import { t, type Static } from "elysia";

export const ConnectionInfoSchema = t.Object({
  userId: t.String(),
  userName: t.String(),
  roomId: t.String(),
  role: t.String(),
});

export const NoteUpdateDataSchema = t.Object({
  noteId: t.String(),
  action: t.Union([
    t.Literal("created"),
    t.Literal("updated"),
    t.Literal("deleted")
  ]),
});

export const MemberUpdateDataSchema = t.Object({
  action: t.Union([
    t.Literal("added"),
    t.Literal("removed"),
    t.Literal("role_changed")
  ]),
  member: t.Optional(t.Object({
    userId: t.String(),
    role: t.String(),
    userName: t.Optional(t.String()),
  })),
});

export const ConnectedDataSchema = t.Object({
  roomId: t.String(),
  userId: t.String(),
});

export const NoteUpdateMessageSchema = t.Object({
  type: t.Literal("note_update"),
  noteId: t.String(),
  action: t.Union([
    t.Literal("created"),
    t.Literal("updated"),
    t.Literal("deleted")
  ]),
});

export const MemberUpdateMessageSchema = t.Object({
  type: t.Literal("member_update"),
  action: t.Union([
    t.Literal("added"),
    t.Literal("removed"),
    t.Literal("role_changed")
  ]),
  member: t.Optional(t.Object({
    userId: t.String(),
    role: t.String(),
    userName: t.Optional(t.String()),
  })),
});

export const ConnectedMessageSchema = t.Object({
  type: t.Literal("connected"),
  roomId: t.String(),
  userId: t.String(),
});

export const ErrorMessageSchema = t.Object({
  type: t.Literal("error"),
  message: t.String(),
});

export const WebSocketMessageDataSchema = t.Union([
  NoteUpdateDataSchema,
  MemberUpdateDataSchema,
]);

export const IncomingMessageSchema = t.Object({
  type: t.Union([
    t.Literal("note_update"),
    t.Literal("member_update"),
  ]),
  roomId: t.String(),
  data: t.Optional(WebSocketMessageDataSchema),
});

export const OutgoingMessageSchema = t.Union([
  NoteUpdateMessageSchema,
  MemberUpdateMessageSchema,
  ConnectedMessageSchema,
  ErrorMessageSchema,
]);

export const WebSocketQuerySchema = t.Object({
  token: t.String(),
  roomId: t.String(),
});

export type ConnectionInfo = Static<typeof ConnectionInfoSchema>;
export type NoteUpdateData = Static<typeof NoteUpdateDataSchema>;
export type MemberUpdateData = Static<typeof MemberUpdateDataSchema>;
export type ConnectedData = Static<typeof ConnectedDataSchema>;

export type NoteUpdateMessage = Static<typeof NoteUpdateMessageSchema>;
export type MemberUpdateMessage = Static<typeof MemberUpdateMessageSchema>;
export type ConnectedMessage = Static<typeof ConnectedMessageSchema>;
export type ErrorMessage = Static<typeof ErrorMessageSchema>;

export type WebSocketMessageData = Static<typeof WebSocketMessageDataSchema>;
export type IncomingMessage = Static<typeof IncomingMessageSchema>;
export type OutgoingMessage = Static<typeof OutgoingMessageSchema>;
export type WebSocketQuery = Static<typeof WebSocketQuerySchema>;

export type TypedWebSocketMessage = NoteUpdateMessage | MemberUpdateMessage | ConnectedMessage | ErrorMessage;
