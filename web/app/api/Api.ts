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
  DeleteApiApiTokensData,
  DeleteApiRoomsByIdData,
  DeleteApiRoomsByIdMembersByMemberIdData,
  DeleteApiRoomsByIdNotesByNoteIdData,
  DeleteApiRoomsByIdNotesByNoteIdError,
  GetApiApiTokensData,
  GetApiAuthSessionData,
  GetApiData,
  GetApiHealthData,
  GetApiImagesByRoomIdByNoteIdData,
  GetApiImagesServeByImageIdData,
  GetApiImagesUrlByImageIdData,
  GetApiRoomsByIdData,
  GetApiRoomsByIdNotesData,
  GetApiRoomsData,
  GetApiRoomsSearchUsersData,
  GetApiRoomsSearchUsersParams,
  GetApiUserData,
  PatchApiApiTokensByTokenIdData,
  PatchApiApiTokensByTokenIdPayload,
  PatchApiRoomsByIdData,
  PatchApiRoomsByIdPayload,
  PostApiApiTokensData,
  PostApiApiTokensPayload,
  PostApiImagesUploadByRoomIdByNoteIdData,
  PostApiImagesUploadByRoomIdByNoteIdPayload,
  PostApiRoomsByIdMembersData,
  PostApiRoomsByIdMembersPayload,
  PostApiRoomsByIdNotesData,
  PostApiRoomsByIdNotesError,
  PostApiRoomsByIdNotesPayload,
  PostApiRoomsData,
  PostApiRoomsPayload,
  PutApiRoomsByIdNotesByNoteIdData,
  PutApiRoomsByIdNotesByNoteIdError,
  PutApiRoomsByIdNotesByNoteIdPayload,
} from "./data-contracts";
import { ContentType, HttpClient, type RequestParams } from "./http-client";

export class Api<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name GetApiRooms
   * @request GET:/api/rooms/
   */
  getApiRooms = (params: RequestParams = {}) =>
    this.request<GetApiRoomsData, any>({
      path: `/api/rooms/`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name PostApiRooms
   * @request POST:/api/rooms/
   */
  postApiRooms = (data: PostApiRoomsPayload, params: RequestParams = {}) =>
    this.request<PostApiRoomsData, any>({
      path: `/api/rooms/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiRoomsById
   * @request GET:/api/rooms/{id}
   */
  getApiRoomsById = (id: string, params: RequestParams = {}) =>
    this.request<GetApiRoomsByIdData, any>({
      path: `/api/rooms/${id}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name PatchApiRoomsById
   * @request PATCH:/api/rooms/{id}
   */
  patchApiRoomsById = (id: string, data: PatchApiRoomsByIdPayload, params: RequestParams = {}) =>
    this.request<PatchApiRoomsByIdData, any>({
      path: `/api/rooms/${id}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name DeleteApiRoomsById
   * @request DELETE:/api/rooms/{id}
   */
  deleteApiRoomsById = (id: string, params: RequestParams = {}) =>
    this.request<DeleteApiRoomsByIdData, any>({
      path: `/api/rooms/${id}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @name PostApiRoomsByIdMembers
   * @request POST:/api/rooms/{id}/members
   */
  postApiRoomsByIdMembers = (
    id: string,
    data: PostApiRoomsByIdMembersPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiRoomsByIdMembersData, any>({
      path: `/api/rooms/${id}/members`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name DeleteApiRoomsByIdMembersByMemberId
   * @request DELETE:/api/rooms/{id}/members/{memberId}
   */
  deleteApiRoomsByIdMembersByMemberId = (
    id: string,
    memberId: string,
    params: RequestParams = {}
  ) =>
    this.request<DeleteApiRoomsByIdMembersByMemberIdData, any>({
      path: `/api/rooms/${id}/members/${memberId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiRoomsSearchUsers
   * @request GET:/api/rooms/search/users
   */
  getApiRoomsSearchUsers = (query: GetApiRoomsSearchUsersParams, params: RequestParams = {}) =>
    this.request<GetApiRoomsSearchUsersData, any>({
      path: `/api/rooms/search/users`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiRoomsByIdNotes
   * @request GET:/api/rooms/{id}/notes
   */
  getApiRoomsByIdNotes = (id: string, params: RequestParams = {}) =>
    this.request<GetApiRoomsByIdNotesData, any>({
      path: `/api/rooms/${id}/notes`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description Create a new note with sections
   *
   * @tags Notes
   * @name PostApiRoomsByIdNotes
   * @summary Create note
   * @request POST:/api/rooms/{id}/notes
   */
  postApiRoomsByIdNotes = (
    id: string,
    data: PostApiRoomsByIdNotesPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiRoomsByIdNotesData, PostApiRoomsByIdNotesError>({
      path: `/api/rooms/${id}/notes`,
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
   * @name PutApiRoomsByIdNotesByNoteId
   * @summary Update note
   * @request PUT:/api/rooms/{id}/notes/{noteId}
   */
  putApiRoomsByIdNotesByNoteId = (
    id: string,
    noteId: string,
    data: PutApiRoomsByIdNotesByNoteIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PutApiRoomsByIdNotesByNoteIdData, PutApiRoomsByIdNotesByNoteIdError>({
      path: `/api/rooms/${id}/notes/${noteId}`,
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
   * @name DeleteApiRoomsByIdNotesByNoteId
   * @summary Delete note
   * @request DELETE:/api/rooms/{id}/notes/{noteId}
   */
  deleteApiRoomsByIdNotesByNoteId = (id: string, noteId: string, params: RequestParams = {}) =>
    this.request<DeleteApiRoomsByIdNotesByNoteIdData, DeleteApiRoomsByIdNotesByNoteIdError>({
      path: `/api/rooms/${id}/notes/${noteId}`,
      method: "DELETE",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiImagesServeByImageId
   * @request GET:/api/images/serve/{imageId}
   */
  getApiImagesServeByImageId = (imageId: string, params: RequestParams = {}) =>
    this.request<GetApiImagesServeByImageIdData, any>({
      path: `/api/images/serve/${imageId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name PostApiImagesUploadByRoomIdByNoteId
   * @request POST:/api/images/upload/{roomId}/{noteId}
   */
  postApiImagesUploadByRoomIdByNoteId = (
    roomId: string,
    noteId: string,
    data: PostApiImagesUploadByRoomIdByNoteIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PostApiImagesUploadByRoomIdByNoteIdData, any>({
      path: `/api/images/upload/${roomId}/${noteId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiImagesByRoomIdByNoteId
   * @request GET:/api/images/{roomId}/{noteId}
   */
  getApiImagesByRoomIdByNoteId = (roomId: string, noteId: string, params: RequestParams = {}) =>
    this.request<GetApiImagesByRoomIdByNoteIdData, any>({
      path: `/api/images/${roomId}/${noteId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiImagesUrlByImageId
   * @request GET:/api/images/url/{imageId}
   */
  getApiImagesUrlByImageId = (imageId: string, params: RequestParams = {}) =>
    this.request<GetApiImagesUrlByImageIdData, any>({
      path: `/api/images/url/${imageId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiApiTokens
   * @request GET:/api/api-tokens/
   */
  getApiApiTokens = (params: RequestParams = {}) =>
    this.request<GetApiApiTokensData, any>({
      path: `/api/api-tokens/`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name PostApiApiTokens
   * @request POST:/api/api-tokens/
   */
  postApiApiTokens = (data: PostApiApiTokensPayload, params: RequestParams = {}) =>
    this.request<PostApiApiTokensData, any>({
      path: `/api/api-tokens/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name DeleteApiApiTokens
   * @request DELETE:/api/api-tokens/
   */
  deleteApiApiTokens = (params: RequestParams = {}) =>
    this.request<DeleteApiApiTokensData, any>({
      path: `/api/api-tokens/`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @name PatchApiApiTokensByTokenId
   * @request PATCH:/api/api-tokens/{tokenId}
   */
  patchApiApiTokensByTokenId = (
    tokenId: string,
    data: PatchApiApiTokensByTokenIdPayload,
    params: RequestParams = {}
  ) =>
    this.request<PatchApiApiTokensByTokenIdData, any>({
      path: `/api/api-tokens/${tokenId}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name DeleteApiApiTokensByTokenId
   * @request DELETE:/api/api-tokens/{tokenId}
   */
  deleteApiApiTokensByTokenId = (tokenId: string, params: RequestParams = {}) =>
    this.request<DeleteApiApiTokensByTokenIdData, any>({
      path: `/api/api-tokens/${tokenId}`,
      method: "DELETE",
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
  /**
   * No description
   *
   * @name GetApiUser
   * @request GET:/api/user
   */
  getApiUser = (params: RequestParams = {}) =>
    this.request<GetApiUserData, any>({
      path: `/api/user`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @name GetApiAuthSession
   * @request GET:/api/auth/session
   */
  getApiAuthSession = (params: RequestParams = {}) =>
    this.request<GetApiAuthSessionData, any>({
      path: `/api/auth/session`,
      method: "GET",
      ...params,
    });
}
