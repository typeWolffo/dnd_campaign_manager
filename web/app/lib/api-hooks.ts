import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { queryKeys } from "./query-keys";
import type { CreateRoomFormData, AddMemberFormData } from "./schemas";
import { ApiClient } from "~/api/api-client";

// Rooms hooks
export const useRooms = () => {
  return useQuery({
    queryKey: queryKeys.rooms.all.queryKey,
    queryFn: async () => {
      // const response = await apiClient.api.rooms.get();
      const response = await ApiClient.getApiRooms();
      if (response.error) throw new Error("Failed to fetch rooms");
      return response.data;
    },
  });
};

export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.rooms.byId(roomId).queryKey,
    queryFn: async () => {
      const response = await ApiClient.getApiRoomsById(roomId);
      return response.data;
    },
    enabled: !!roomId,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomFormData) => {
      const response = await apiClient.api.rooms.post(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all.queryKey });
    },
  });
};

export const useUpdateRoom = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateRoomFormData>) => {
      const response = await apiClient.api.rooms({ id: roomId }).patch(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all.queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId).queryKey });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await apiClient.api.rooms({ id: roomId }).delete();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all.queryKey });
    },
  });
};

// Room members hooks
export const useAddMember = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberFormData) => {
      const response = await apiClient.api.rooms({ id: roomId }).members.post(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId).queryKey });
    },
  });
};

export const useRemoveMember = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiClient.api.rooms({ id: roomId }).members({ memberId }).delete();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId).queryKey });
    },
  });
};

// User search hook
export const useSearchUsers = (email: string) => {
  return useQuery({
    queryKey: queryKeys.users.search(email).queryKey,
    queryFn: async () => {
      if (!email || email.length < 3) return [];
      const response = await apiClient.api.rooms.search.users.get({ query: { email } });
      return response.data || [];
    },
    enabled: email.length >= 3,
    staleTime: 30000, // 30 seconds
  });
};

// Notes hooks
export const useRoomNotes = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.notes.byRoomId(roomId).queryKey,
    queryFn: async () => {
      const response = await ApiClient.getApiRoomsByIdNotes(roomId);

      return response.data;
    },
    enabled: !!roomId,
  });
};

export const useNoteImages = (roomId: string, noteId: string) => {
  return useQuery({
    queryKey: queryKeys.images.byNoteId(roomId, noteId).queryKey,
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/images/${roomId}/${noteId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      return response.json();
    },
    enabled: !!roomId && !!noteId,
  });
};

// API Tokens hooks
export const useApiTokens = () => {
  return useQuery({
    queryKey: queryKeys.auth.apiTokens.queryKey,
    queryFn: async () => {
      const response = await apiClient.api["api-tokens"].get();
      return response.data?.tokens || [];
    },
  });
};

export const useCreateApiToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; permissions?: string[]; expiresAt?: Date }) => {
      const response = await apiClient.api["api-tokens"].post(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.apiTokens.queryKey });
    },
  });
};

export const useDeleteApiToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      const response = await apiClient.api["api-tokens"]({ tokenId }).delete();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.apiTokens.queryKey });
    },
  });
};

export const useRevokeAllApiTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.api["api-tokens"].delete();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.apiTokens.queryKey });
    },
  });
};
