import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api";
import { queryKeys } from "./query-keys";
import type { CreateRoomFormData, AddMemberFormData } from "./schemas";

// Rooms hooks
export const useRooms = () => {
  return useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: async () => {
      const response = await apiClient.api.rooms.get();
      if (response.error) throw new Error("Failed to fetch rooms");
      return response.data || [];
    },
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomFormData) => {
      const response = await apiClient.api.rooms.post(data);
      if (response.error) throw new Error("Failed to create room");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
};

// Simplified stubs for other hooks (to be implemented later)
export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.rooms.byId(roomId),
    queryFn: async () => {
      // TODO: Implement room by ID endpoint
      return null;
    },
    enabled: false, // Disable for now
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      // TODO: Implement delete room endpoint
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
};

export const useAddMember = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberFormData) => {
      // TODO: Implement add member endpoint
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId) });
    },
  });
};

export const useRemoveMember = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      // TODO: Implement remove member endpoint
      throw new Error("Not implemented");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId) });
    },
  });
};

export const useSearchUsers = (email: string) => {
  return useQuery({
    queryKey: queryKeys.users.search(email),
    queryFn: async () => {
      // TODO: Implement user search endpoint
      return [];
    },
    enabled: false, // Disable for now
  });
};

export const useRoomNotes = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.notes.byRoomId(roomId),
    queryFn: async () => {
      // TODO: Implement room notes endpoint
      return [];
    },
    enabled: false, // Disable for now
  });
};

export const useNoteImages = (roomId: string, noteId: string) => {
  return useQuery({
    queryKey: queryKeys.images.byNoteId(roomId, noteId),
    queryFn: async () => {
      // TODO: Implement note images endpoint
      return [];
    },
    enabled: false, // Disable for now
  });
};
