import { t } from 'elysia';
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { notes, noteSections } from '../../db/schema';

// Generate schemas from database tables
export const CreateNoteSchema = createInsertSchema(notes, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  lastSync: undefined,
});

export const UpdateNoteSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
  content: t.Optional(t.String()),
  obsidianPath: t.Optional(t.String({ maxLength: 1000 })),
});

export const SelectNoteSchema = createSelectSchema(notes);

export const CreateNoteSectionSchema = createInsertSchema(noteSections, {
  id: undefined,
  noteId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const SelectNoteSectionSchema = createSelectSchema(noteSections);

// Composite schemas for notes with sections
export const CreateNoteWithSectionsSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 500 }),
  obsidianPath: t.Optional(t.String({ maxLength: 1000 })),
  sections: t.Array(t.Object({
    content: t.String(),
    isPublic: t.Boolean(),
    orderIndex: t.Number(),
  })),
});

export const UpdateNoteWithSectionsSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
  obsidianPath: t.Optional(t.String({ maxLength: 1000 })),
  sections: t.Optional(t.Array(t.Object({
    content: t.String(),
    isPublic: t.Boolean(),
    orderIndex: t.Number(),
  }))),
});

// Parameter schemas
export const RoomIdSchema = t.Object({
  roomId: t.String(),
});

export const NoteIdSchema = t.Object({
  roomId: t.String(),
  noteId: t.String(),
});

// Response schemas
export const CreateNoteResponseSchema = t.Object({
  id: t.String(),
  created: t.Optional(t.Boolean()),
  updated: t.Optional(t.Boolean()),
});

export const NoteWithSectionsSchema = t.Object({
  id: t.String(),
  title: t.String(),
  content: t.String(),
  obsidianPath: t.String(),
  lastSync: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
  roomId: t.String(),
  sections: t.Array(SelectNoteSectionSchema),
});

export const NotesResponseSchema = t.Array(NoteWithSectionsSchema);

export const ErrorResponseSchema = t.Object({
  error: t.String(),
  message: t.Optional(t.String()),
});

export const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
});
