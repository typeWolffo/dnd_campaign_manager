/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type GetApiRoomsData = {
  id: string;
  name: string;
  description: string | null;
  gmId: string | null;
  createdAt: string;
  updatedAt: string;
  isGM: boolean;
  members: {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userName: string | null;
    userEmail: string;
  }[];
}[];

export interface PostApiRoomsPayload {
  createdAt?: string;
  updatedAt?: string;
  /** @format uuid */
  id?: string;
  /** @maxLength 255 */
  name: string;
  description?: string | null;
  gmId?: string | null;
}

export type PostApiRoomsData = any;

export interface GetApiRoomsByIdData {
  id: string;
  name: string;
  description: string | null;
  gmId: string | null;
  createdAt: string;
  updatedAt: string;
  isGM: boolean;
  members: {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userName: string | null;
    userEmail: string;
  }[];
}

export interface PatchApiRoomsByIdPayload {
  createdAt?: string;
  updatedAt?: string;
  /** @format uuid */
  id?: string;
  /** @maxLength 255 */
  name?: string;
  description?: string | null;
  gmId?: string | null;
}

export type PatchApiRoomsByIdData = any;

export type DeleteApiRoomsByIdData = any;

export interface PostApiRoomsByIdMembersPayload {
  /**
   * @minLength 5
   * @pattern ^[^@\s]+@[^@\s]+\.[^@\s]+$
   */
  email: string;
  /** @default "player" */
  role?: "player" | "gm";
}

export type PostApiRoomsByIdMembersData = any;

export type DeleteApiRoomsByIdMembersByMemberIdData = any;

export interface GetApiRoomsSearchUsersParams {
  email: string;
}

export type GetApiRoomsSearchUsersData = any;

export type GetApiRoomsByIdNotesData = {
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @format uuid */
  roomId: string;
  /** @maxLength 500 */
  title: string;
  content?: string;
  /** @maxLength 1000 */
  obsidianPath: string;
  lastSync: string | null;
  sections: {
    createdAt: string;
    updatedAt: string;
    /** @format uuid */
    id: string;
    /** @format uuid */
    noteId: string;
    content: string;
    isPublic: boolean;
    /**
     * @min -2147483648
     * @max 2147483647
     */
    orderIndex: number;
  }[];
}[];

export interface PostApiRoomsByIdNotesPayload {
  title: string;
  obsidianPath?: string;
  sections: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

export interface PostApiRoomsByIdNotesData {
  id: string;
  created?: boolean;
  updated?: boolean;
}

export type PostApiRoomsByIdNotesError = {
  error: string;
  message?: string;
};

export interface PutApiRoomsByIdNotesByNoteIdPayload {
  title?: string;
  obsidianPath?: string;
  sections?: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

export interface PutApiRoomsByIdNotesByNoteIdData {
  success: boolean;
}

export type PutApiRoomsByIdNotesByNoteIdError = {
  error: string;
  message?: string;
};

export interface DeleteApiRoomsByIdNotesByNoteIdData {
  success: boolean;
}

export type DeleteApiRoomsByIdNotesByNoteIdError = {
  error: string;
  message?: string;
};

export type GetApiImagesServeByImageIdData = any;

export interface PostApiImagesUploadByRoomIdByNoteIdPayload {
  files: File | File[];
}

export type PostApiImagesUploadByRoomIdByNoteIdData = any;

export type GetApiImagesByRoomIdByNoteIdData = any;

export type GetApiImagesUrlByImageIdData = any;

export type GetApiApiTokensData = any;

export interface PostApiApiTokensPayload {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

export type PostApiApiTokensData = any;

export type DeleteApiApiTokensData = any;

export interface PatchApiApiTokensByTokenIdPayload {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name?: string;
}

export type PatchApiApiTokensByTokenIdData = any;

export type DeleteApiApiTokensByTokenIdData = any;

export type GetApiData = any;

export type GetApiHealthData = any;

export type GetApiUserData = any;

export type GetApiAuthSessionData = any;
