import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { queryKeys } from "./query-keys";
import type { CreateRoomFormData, AddMemberFormData } from "./schemas";

// Rooms hooks
export const useRooms = () => {
  return useQuery({
    queryKey: queryKeys.rooms.all.queryKey,
    queryFn: async () => {
      const response = await apiClient.api.rooms.get();
      if (response.error) throw new Error("Failed to fetch rooms");
      return response.data;
    },
  });
};

export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.rooms.byId(roomId).queryKey,
    queryFn: async () => {
      const response = await apiClient.api.rooms({ id: roomId }).get();
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
      const response = await apiClient.api.rooms({ id: roomId }).notes.get();
      if (response.error) throw new Error("Failed to fetch notes");
      return response.data;
    },
    enabled: !!roomId,
  });
};
