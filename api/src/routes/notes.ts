import { Elysia, t, type Context } from "elysia";
import { db } from "../db/connection";
import { notes, noteSections, rooms, roomMembers } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "../auth/config";
import { broadcastToRoom } from "../lib/websocket-utils";

const RoomIdSchema = t.Object({
  id: t.String(),
});

const NoteIdSchema = t.Object({
  id: t.String(),
  noteId: t.String(),
});

type SectionInput = {
  content: string;
  isPublic: boolean;
  orderIndex: number;
};

const CreateNoteWithSectionsSchema = t.Object({
  title: t.String(),
  obsidianPath: t.Optional(t.String()),
  sections: t.Array(t.Object({
    content: t.String(),
    isPublic: t.Boolean(),
    orderIndex: t.Number(),
  })),
});

const UpdateNoteWithSectionsSchema = t.Partial(CreateNoteWithSectionsSchema);

export const notesRouter = new Elysia({ prefix: "/rooms" })
  .derive(async ({ request }: Context) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return { auth: session };
  })

  .get("/:id/notes", async ({ params, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const roomAccess = await db
      .select({ isGM: eq(rooms.gmId, auth.user.id) })
      .from(rooms)
      .leftJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
      .where(
        and(
          eq(rooms.id, params.id),
          eq(roomMembers.userId, auth.user.id)
        )
      )
      .limit(1);

    const isGM = await db
      .select()
      .from(rooms)
      .where(and(
        eq(rooms.id, params.id),
        eq(rooms.gmId, auth.user.id)
      ))
      .limit(1);

    if (!roomAccess[0] && !isGM[0]) {
      throw new Error("Access denied");
    }

    const userIsGM = !!isGM[0];

    const roomNotes = await db
      .select({
        id: notes.id,
        title: notes.title,
        obsidianPath: notes.obsidianPath,
        lastSync: notes.lastSync,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        sectionId: noteSections.id,
        content: noteSections.content,
        isPublic: noteSections.isPublic,
        orderIndex: noteSections.orderIndex,
      })
      .from(notes)
      .leftJoin(noteSections, eq(noteSections.noteId, notes.id))
      .where(and(eq(notes.roomId, params.id), eq(noteSections.isPublic, true)))
      .orderBy(desc(notes.updatedAt), noteSections.orderIndex);

    const notesMap = new Map();

    for (const row of roomNotes) {
      if (!row.id) continue;

      if (!notesMap.has(row.id)) {
        notesMap.set(row.id, {
          id: row.id,
          title: row.title,
          obsidianPath: row.obsidianPath,
          lastSync: row.lastSync,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          sections: [],
        });
      }

      if (row.sectionId) {
        if (userIsGM || row.isPublic) {
          notesMap.get(row.id).sections.push({
            id: row.sectionId,
            content: row.content,
            isPublic: row.isPublic,
            orderIndex: row.orderIndex,
          });
        }
      }
    }

    return Array.from(notesMap.values());
  }, {
    params: RoomIdSchema,
  })

  .post("/:id/notes", async ({ params, body, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(and(
        eq(rooms.id, params.id),
        eq(rooms.gmId, auth.user.id)
      ))
      .limit(1);

    if (!room[0]) {
      throw new Error("Only GMs can create notes");
    }

    let existingNote = null;
    if (body.obsidianPath) {
      const existing = await db
        .select()
        .from(notes)
        .where(and(
          eq(notes.roomId, params.id),
          eq(notes.obsidianPath, body.obsidianPath)
        ))
        .limit(1);
      existingNote = existing[0];
    }

    if (existingNote) {
      await db
        .update(notes)
        .set({
          title: body.title,
          lastSync: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(notes.id, existingNote.id));

      await db
        .delete(noteSections)
        .where(eq(noteSections.noteId, existingNote.id));

      if (body.sections.length > 0) {
        await db
          .insert(noteSections)
          .values(body.sections.map((section: SectionInput) => ({
            noteId: existingNote.id,
            content: section.content,
            isPublic: section.isPublic,
            orderIndex: section.orderIndex,
          })));
      }

      broadcastToRoom(params.id, {
        type: "note_update",
        action: "updated",
        noteId: existingNote.id,
      });

      return { id: existingNote.id, updated: true };
    } else {
      const newNote = await db
        .insert(notes)
        .values({
          roomId: params.id,
          title: body.title,
          content: "",
          obsidianPath: body.obsidianPath,
          lastSync: new Date(),
        })
        .returning();

      if (body.sections.length > 0) {
        await db
          .insert(noteSections)
          .values(body.sections.map((section: SectionInput) => ({
            noteId: newNote[0].id,
            content: section.content,
            isPublic: section.isPublic,
            orderIndex: section.orderIndex,
          })));
      }

      broadcastToRoom(params.id, {
        type: "note_update",
        action: "created",
        noteId: newNote[0].id,
      });

      return { id: newNote[0].id, created: true };
    }
  }, {
    params: RoomIdSchema,
    body: CreateNoteWithSectionsSchema,
  })

  .put("/:id/notes/:noteId", async ({ params, body, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const noteCheck = await db
      .select()
      .from(notes)
      .innerJoin(rooms, eq(rooms.id, notes.roomId))
      .where(and(
        eq(notes.id, params.noteId),
        eq(notes.roomId, params.id),
        eq(rooms.gmId, auth.user.id)
      ))
      .limit(1);

    if (!noteCheck[0]) {
      throw new Error("Note not found or access denied");
    }

    await db
      .update(notes)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.obsidianPath && { obsidianPath: body.obsidianPath }),
        lastSync: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, params.noteId));

    if (body.sections) {
      await db
        .delete(noteSections)
        .where(eq(noteSections.noteId, params.noteId));

      if (body.sections.length > 0) {
        await db
          .insert(noteSections)
          .values(body.sections.map((section: SectionInput) => ({
            noteId: params.noteId,
            content: section.content,
            isPublic: section.isPublic,
            orderIndex: section.orderIndex,
          })));
      }
    }

    broadcastToRoom(params.id, {
      type: "note_update",
      action: "updated",
      noteId: params.noteId,
    });

    return { success: true };
  }, {
    params: NoteIdSchema,
    body: UpdateNoteWithSectionsSchema,
  })

  .delete("/:id/notes/:noteId", async ({ params, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const noteCheck = await db
      .select()
      .from(notes)
      .innerJoin(rooms, eq(rooms.id, notes.roomId))
      .where(and(
        eq(notes.id, params.noteId),
        eq(notes.roomId, params.id),
        eq(rooms.gmId, auth.user.id)
      ))
      .limit(1);

    if (!noteCheck[0]) {
      throw new Error("Note not found or access denied");
    }

    await db
      .delete(notes)
      .where(eq(notes.id, params.noteId));

    broadcastToRoom(params.id, {
      type: "note_update",
      action: "deleted",
      noteId: params.noteId,
    });

    return { success: true };
  }, {
    params: NoteIdSchema,
  });
