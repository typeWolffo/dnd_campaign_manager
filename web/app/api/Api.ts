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

import type {
  DeleteApiApiTokensByTokenIdData,
  DeleteApiApiTokensByTokenIdError,
  DeleteApiApiTokensData,
  DeleteApiApiTokensError,
  DeleteApiRoomsByRoomIdData,
  DeleteApiRoomsByRoomIdError,
  DeleteApiRoomsByRoomIdMembersByMemberIdData,
  DeleteApiRoomsByRoomIdMembersByMemberIdError,
  DeleteApiRoomsByRoomIdNotesByNoteIdData,
  DeleteApiRoomsByRoomIdNotesByNoteIdError,
  GetApiApiTokensData,
  GetApiApiTokensError,
  GetApiData,
  GetApiHealthData,
  GetApiImagesByRoomIdByNoteIdData,
  GetApiImagesByRoomIdByNoteIdError,
  GetApiImagesServeByImageIdError,
  GetApiImagesUrlByImageIdData,
  GetApiImagesUrlByImageIdError,
  GetApiRoomsByRoomIdData,
  GetApiRoomsByRoomIdError,
  GetApiRoomsByRoomIdMembersData,
  GetApiRoomsByRoomIdMembersError,
  GetApiRoomsByRoomIdNotesData,
  GetApiRoomsByRoomIdNotesError,
  GetApiRoomsData,
  GetApiRoomsError,
  PatchApiApiTokensByTokenIdData,
  PatchApiApiTokensByTokenIdError,
  PatchApiApiTokensByTokenIdPayload,
  PatchApiRoomsByRoomIdData,
  PatchApiRoomsByRoomIdError,
  PatchApiRoomsByRoomIdPayload,
  PostApiApiTokensData,
  PostApiApiTokensError,
  PostApiApiTokensPayload,
  PostApiImagesUploadByRoomIdByNoteIdData,
  PostApiImagesUploadByRoomIdByNoteIdError,
  PostApiImagesUploadByRoomIdByNoteIdPayload,
  PostApiRoomsByRoomIdMembersData,
  PostApiRoomsByRoomIdMembersError,
  PostApiRoomsByRoomIdMembersPayload,
  PostApiRoomsByRoomIdNotesData,
  PostApiRoomsByRoomIdNotesError,
  PostApiRoomsByRoomIdNotesPayload,
  PostApiRoomsData,
  PostApiRoomsError,
  PostApiRoomsPayload,
  PutApiRoomsByRoomIdNotesByNoteIdData,
  PutApiRoomsByRoomIdNotesByNoteIdError,
  PutApiRoomsByRoomIdNotesByNoteIdPayload,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Api<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Get all rooms for the authenticated user
   *
   * @tags Rooms
   * @name GetApiRooms
   * @summary Get user rooms
   * @request GET:/api/rooms/
   */
  getApiRooms = (params: RequestParams = {}) =>
    this.request<GetApiRoomsData, GetApiRoomsError>({
      path: `/api/rooms/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new room
   *
   * @tags Rooms
   * @name PostApiRooms
   * @summary Create room
   * @request POST:/api/rooms/
   */
  postApiRooms = (data: PostApiRoomsPayload, params: RequestParams = {}) =>
    this.request<PostApiRoomsData, PostApiRoomsError>({
      path: `/api/rooms/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get a specific room by ID
   *
   * @tags Rooms
   * @name GetApiRoomsByRoomId
   * @summary Get room
   * @request GET:/api/rooms/{roomId}
   */
  getApiRoomsByRoomId = (roomId: string, params: RequestParams = {}) =>
    this.request<GetApiRoomsByRoomIdData, GetApiRoomsByRoomIdError>({
      path: `/api/rooms/${roomId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Update room details (GM only)
   *
   * @tags Rooms
   * @name PatchApiRoomsByRoomId
   * @summary Update room
   * @request PATCH:/api/rooms/{roomId}
   */
  patchApiRoomsByRoomId = (
    roomId: string,
    data: PatchApiRoomsByRoomIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PatchApiRoomsByRoomIdData, PatchApiRoomsByRoomIdError>({
      path: `/api/rooms/${roomId}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a room (GM only)
   *
   * @tags Rooms
   * @name DeleteApiRoomsByRoomId
   * @summary Delete room
   * @request DELETE:/api/rooms/{roomId}
   */
  deleteApiRoomsByRoomId = (roomId: string, params: RequestParams = {}) =>
    this.request<DeleteApiRoomsByRoomIdData, DeleteApiRoomsByRoomIdError>({
      path: `/api/rooms/${roomId}`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * @description Get all members of a specific room
   *
   * @tags Rooms
   * @name GetApiRoomsByRoomIdMembers
   * @summary Get room members
   * @request GET:/api/rooms/{roomId}/members
   */
  getApiRoomsByRoomIdMembers = (roomId: string, params: RequestParams = {}) =>
    this.request<GetApiRoomsByRoomIdMembersData, GetApiRoomsByRoomIdMembersError>({
      path: `/api/rooms/${roomId}/members`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Add a new member to the room (GM only)
   *
   * @tags Rooms
   * @name PostApiRoomsByRoomIdMembers
   * @summary Add room member
   * @request POST:/api/rooms/{roomId}/members
   */
  postApiRoomsByRoomIdMembers = (
    roomId: string,
    data: PostApiRoomsByRoomIdMembersPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiRoomsByRoomIdMembersData, PostApiRoomsByRoomIdMembersError>({
      path: `/api/rooms/${roomId}/members`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Remove a member from the room (GM only)
   *
   * @tags Rooms
   * @name DeleteApiRoomsByRoomIdMembersByMemberId
   * @summary Remove room member
   * @request DELETE:/api/rooms/{roomId}/members/{memberId}
   */
  deleteApiRoomsByRoomIdMembersByMemberId = (
    roomId: string,
    memberId: string,
    params: RequestParams = {}
  ) =>
    this.request<
      DeleteApiRoomsByRoomIdMembersByMemberIdData,
      DeleteApiRoomsByRoomIdMembersByMemberIdError
    >({
      path: `/api/rooms/${roomId}/members/${memberId}`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * @description Get all notes for a specific room
   *
   * @tags Notes
   * @name GetApiRoomsByRoomIdNotes
   * @summary Get notes
   * @request GET:/api/rooms/{roomId}/notes
   */
  getApiRoomsByRoomIdNotes = (roomId: string, params: RequestParams = {}) =>
    this.request<GetApiRoomsByRoomIdNotesData, GetApiRoomsByRoomIdNotesError>({
      path: `/api/rooms/${roomId}/notes`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new note with sections
   *
   * @tags Notes
   * @name PostApiRoomsByRoomIdNotes
   * @summary Create note
   * @request POST:/api/rooms/{roomId}/notes
   */
  postApiRoomsByRoomIdNotes = (
    roomId: string,
    data: PostApiRoomsByRoomIdNotesPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiRoomsByRoomIdNotesData, PostApiRoomsByRoomIdNotesError>({
      path: `/api/rooms/${roomId}/notes`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Update an existing note
   *
   * @tags Notes
   * @name PutApiRoomsByRoomIdNotesByNoteId
   * @summary Update note
   * @request PUT:/api/rooms/{roomId}/notes/{noteId}
   */
  putApiRoomsByRoomIdNotesByNoteId = (
    roomId: string,
    noteId: string,
    data: PutApiRoomsByRoomIdNotesByNoteIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PutApiRoomsByRoomIdNotesByNoteIdData, PutApiRoomsByRoomIdNotesByNoteIdError>({
      path: `/api/rooms/${roomId}/notes/${noteId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a note
   *
   * @tags Notes
   * @name DeleteApiRoomsByRoomIdNotesByNoteId
   * @summary Delete note
   * @request DELETE:/api/rooms/{roomId}/notes/{noteId}
   */
  deleteApiRoomsByRoomIdNotesByNoteId = (
    roomId: string,
    noteId: string,
    params: RequestParams = {}
  ) =>
    this.request<DeleteApiRoomsByRoomIdNotesByNoteIdData, DeleteApiRoomsByRoomIdNotesByNoteIdError>(
      {
        path: `/api/rooms/${roomId}/notes/${noteId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }
    );
  /**
   * @description Get all API tokens for the authenticated user
   *
   * @tags API Tokens
   * @name GetApiApiTokens
   * @summary Get user API tokens
   * @request GET:/api/api-tokens/
   */
  getApiApiTokens = (params: RequestParams = {}) =>
    this.request<GetApiApiTokensData, GetApiApiTokensError>({
      path: `/api/api-tokens/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new API token
   *
   * @tags API Tokens
   * @name PostApiApiTokens
   * @summary Create API token
   * @request POST:/api/api-tokens/
   */
  postApiApiTokens = (data: PostApiApiTokensPayload, params: RequestParams = {}) =>
    this.request<PostApiApiTokensData, PostApiApiTokensError>({
      path: `/api/api-tokens/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Revoke all API tokens for the authenticated user
   *
   * @tags API Tokens
   * @name DeleteApiApiTokens
   * @summary Revoke all tokens
   * @request DELETE:/api/api-tokens/
   */
  deleteApiApiTokens = (params: RequestParams = {}) =>
    this.request<DeleteApiApiTokensData, DeleteApiApiTokensError>({
      path: `/api/api-tokens/`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * @description Update an existing API token (name only)
   *
   * @tags API Tokens
   * @name PatchApiApiTokensByTokenId
   * @summary Update API token
   * @request PATCH:/api/api-tokens/{tokenId}
   */
  patchApiApiTokensByTokenId = (
    tokenId: string,
    data: PatchApiApiTokensByTokenIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PatchApiApiTokensByTokenIdData, PatchApiApiTokensByTokenIdError>({
      path: `/api/api-tokens/${tokenId}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a specific API token
   *
   * @tags API Tokens
   * @name DeleteApiApiTokensByTokenId
   * @summary Delete API token
   * @request DELETE:/api/api-tokens/{tokenId}
   */
  deleteApiApiTokensByTokenId = (tokenId: string, params: RequestParams = {}) =>
    this.request<DeleteApiApiTokensByTokenIdData, DeleteApiApiTokensByTokenIdError>({
      path: `/api/api-tokens/${tokenId}`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * @description Serve an image file directly from storage
   *
   * @tags Images
   * @name GetApiImagesServeByImageId
   * @summary Serve image
   * @request GET:/api/images/serve/{imageId}
   */
  getApiImagesServeByImageId = (imageId: string, params: RequestParams = {}) =>
    this.request<any, GetApiImagesServeByImageIdError>({
      path: `/api/images/serve/${imageId}`,
      method: "GET",
      ...params,
    });
  /**
   * @description Upload one or more images to a note
   *
   * @tags Images
   * @name PostApiImagesUploadByRoomIdByNoteId
   * @summary Upload images
   * @request POST:/api/images/upload/{roomId}/{noteId}
   */
  postApiImagesUploadByRoomIdByNoteId = (
    roomId: string,
    noteId: string,
    data: PostApiImagesUploadByRoomIdByNoteIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiImagesUploadByRoomIdByNoteIdData, PostApiImagesUploadByRoomIdByNoteIdError>(
      {
        path: `/api/images/upload/${roomId}/${noteId}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }
    );
  /**
   * @description Get all images for a specific note
   *
   * @tags Images
   * @name GetApiImagesByRoomIdByNoteId
   * @summary Get images
   * @request GET:/api/images/{roomId}/{noteId}
   */
  getApiImagesByRoomIdByNoteId = (roomId: string, noteId: string, params: RequestParams = {}) =>
    this.request<GetApiImagesByRoomIdByNoteIdData, GetApiImagesByRoomIdByNoteIdError>({
      path: `/api/images/${roomId}/${noteId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Get the URL for a specific image
   *
   * @tags Images
   * @name GetApiImagesUrlByImageId
   * @summary Get image URL
   * @request GET:/api/images/url/{imageId}
   */
  getApiImagesUrlByImageId = (imageId: string, params: RequestParams = {}) =>
    this.request<GetApiImagesUrlByImageIdData, GetApiImagesUrlByImageIdError>({
      path: `/api/images/url/${imageId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApi
   * @request GET:/api/
   */
  getApi = (params: RequestParams = {}) =>
    this.request<GetApiData, any>({
      path: `/api/`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiHealth
   * @request GET:/api/health
   */
  getApiHealth = (params: RequestParams = {}) =>
    this.request<GetApiHealthData, any>({
      path: `/api/health`,
      method: "GET",
      ...params,
    });
}
