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
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @maxLength 255 */
  name: string;
  description: string | null;
  gmId: string | null;
  isGM: boolean;
  members: {
    createdAt: string;
    updatedAt: string;
    /** @format uuid */
    id: string;
    /** @format uuid */
    roomId: string;
    /** @format uuid */
    userId: string;
    /** @maxLength 50 */
    role: string;
    joinedAt: string;
    userName: string;
    userEmail: string;
  }[];
}[];

export type GetApiRoomsError = {
  error: string;
};

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

export interface PostApiRoomsData {
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @maxLength 255 */
  name: string;
  description: string | null;
  gmId: string | null;
}

export type PostApiRoomsError = {
  error: string;
};

export interface GetApiRoomsByRoomIdData {
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @maxLength 255 */
  name: string;
  description: string | null;
  gmId: string | null;
  isGM: boolean;
  members: {
    createdAt: string;
    updatedAt: string;
    /** @format uuid */
    id: string;
    /** @format uuid */
    roomId: string;
    /** @format uuid */
    userId: string;
    /** @maxLength 50 */
    role: string;
    joinedAt: string;
    userName: string;
    userEmail: string;
  }[];
}

export type GetApiRoomsByRoomIdError = {
  error: string;
};

export interface PatchApiRoomsByRoomIdPayload {
  /**
   * @minLength 1
   * @maxLength 255
   */
  name?: string;
  description?: string | null;
}

export interface PatchApiRoomsByRoomIdData {
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @maxLength 255 */
  name: string;
  description: string | null;
  gmId: string | null;
}

export type PatchApiRoomsByRoomIdError = {
  error: string;
};

export interface DeleteApiRoomsByRoomIdData {
  message: string;
}

export type DeleteApiRoomsByRoomIdError = {
  error: string;
};

export type GetApiRoomsByRoomIdMembersData = {
  createdAt: string;
  updatedAt: string;
  /** @format uuid */
  id: string;
  /** @format uuid */
  roomId: string;
  /** @format uuid */
  userId: string;
  /** @maxLength 50 */
  role: string;
  joinedAt: string;
}[];

export type GetApiRoomsByRoomIdMembersError = {
  error: string;
};

export interface PostApiRoomsByRoomIdMembersPayload {
  userId: string;
  role?: string;
}

export interface PostApiRoomsByRoomIdMembersData {
  member: {
    createdAt: string;
    updatedAt: string;
    /** @format uuid */
    id: string;
    /** @format uuid */
    roomId: string;
    /** @format uuid */
    userId: string;
    /** @maxLength 50 */
    role: string;
    joinedAt: string;
  };
}

export type PostApiRoomsByRoomIdMembersError = {
  error: string;
};

export interface DeleteApiRoomsByRoomIdMembersByMemberIdData {
  message: string;
}

export type DeleteApiRoomsByRoomIdMembersByMemberIdError = {
  error: string;
};

export type GetApiRoomsByRoomIdNotesData = {
  id: string;
  title: string;
  content: string;
  obsidianPath: string;
  lastSync: string | null;
  createdAt: string;
  updatedAt: string;
  roomId: string;
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

export type GetApiRoomsByRoomIdNotesError = {
  error: string;
  message?: string;
};

export interface PostApiRoomsByRoomIdNotesPayload {
  /**
   * @minLength 1
   * @maxLength 500
   */
  title: string;
  /** @maxLength 1000 */
  obsidianPath?: string;
  sections: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

export interface PostApiRoomsByRoomIdNotesData {
  id: string;
  created?: boolean;
  updated?: boolean;
}

export type PostApiRoomsByRoomIdNotesError = {
  error: string;
  message?: string;
};

export interface PutApiRoomsByRoomIdNotesByNoteIdPayload {
  /**
   * @minLength 1
   * @maxLength 500
   */
  title?: string;
  /** @maxLength 1000 */
  obsidianPath?: string;
  sections?: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

export interface PutApiRoomsByRoomIdNotesByNoteIdData {
  success: boolean;
}

export type PutApiRoomsByRoomIdNotesByNoteIdError = {
  error: string;
  message?: string;
};

export interface DeleteApiRoomsByRoomIdNotesByNoteIdData {
  success: boolean;
}

export type DeleteApiRoomsByRoomIdNotesByNoteIdError = {
  error: string;
  message?: string;
};

export interface GetApiApiTokensData {
  tokens: {
    id: string;
    userId: string;
    name: string;
    permissions: string[] | null;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
}

export type GetApiApiTokensError = {
  error: string;
};

export interface PostApiApiTokensPayload {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

export interface PostApiApiTokensData {
  token: {
    id: string;
    userId: string;
    name: string;
    permissions: string[] | null;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  tokenValue: string;
  message: string;
}

export type PostApiApiTokensError = {
  error: string;
};

export interface DeleteApiApiTokensData {
  message: string;
  revokedCount: number;
}

export type DeleteApiApiTokensError = {
  error: string;
};

export interface PatchApiApiTokensByTokenIdPayload {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name?: string;
}

export interface PatchApiApiTokensByTokenIdData {
  token: {
    id: string;
    userId: string;
    name: string;
    permissions: string[] | null;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export type PatchApiApiTokensByTokenIdError = {
  error: string;
};

export interface DeleteApiApiTokensByTokenIdData {
  message: string;
}

export type DeleteApiApiTokensByTokenIdError = {
  error: string;
};

export type GetApiImagesServeByImageIdError = {
  error: string;
};

export interface PostApiImagesUploadByRoomIdByNoteIdPayload {
  files: File | File[];
}

export interface PostApiImagesUploadByRoomIdByNoteIdData {
  success: boolean;
  images: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
  }[];
}

export type PostApiImagesUploadByRoomIdByNoteIdError = {
  error: string;
};

export interface GetApiImagesByRoomIdByNoteIdData {
  images: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: string;
  }[];
}

export type GetApiImagesByRoomIdByNoteIdError = {
  error: string;
};

export interface GetApiImagesUrlByImageIdData {
  url: string;
}

export type GetApiImagesUrlByImageIdError = {
  error: string;
};

export type GetApiData = any;

export type GetApiHealthData = any;

export type GetApiUserData = any;

export type GetApiAuthSessionData = any;

export type GetIndexData = any;
