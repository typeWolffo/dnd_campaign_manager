import { useNavigate, Link, redirect, useLoaderData } from "react-router";
import { useSession } from "../lib/auth-client";
import { useRoom, useRemoveMember } from "../lib/api-hooks";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AddMemberDialog } from "../components/AddMemberDialog";
import { NotesSection } from "../components/NotesSection";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { Route } from "./+types/room-details";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  if (!params.roomId) {
    redirect("/dashboard");
  }

  return { roomId: params.roomId };
};

export default function RoomDetails() {
  const { roomId } = useLoaderData<typeof clientLoader>();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: room, isLoading: roomLoading, error: roomError } = useRoom(roomId);
  const navigate = useNavigate();
  const removeMember = useRemoveMember(roomId);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/sign-in");
    }
  }, [session, sessionLoading, navigate]);

  if (sessionLoading || roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Room Not Found</CardTitle>
            <CardDescription>
              The room you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGM = room.gmId === session.user.id;

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">← Back</Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
                <Badge variant={isGM ? "default" : "secondary"}>
                  {isGM ? "Game Master" : "Player"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Description</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {room.description || "No description provided."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Created</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {new Date(room.createdAt).toLocaleDateString()} at{" "}
                      {new Date(room.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Last Updated</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {new Date(room.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(room.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notes section */}
              <div className="mt-6">
                <NotesSection roomId={roomId} isGM={isGM} />
              </div>
            </div>

            {/* Members sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Members ({room.members?.length || 0})</CardTitle>
                    {isGM && (
                      <AddMemberDialog roomId={roomId} existingMembers={room.members || []} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {room.members?.map(member => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(member.userName || member.userEmail).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.userName || member.userEmail}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.userEmail}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={member.role === "gm" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {member.role?.toUpperCase()}
                          </Badge>
                          {isGM && member.role !== "gm" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setMemberToRemove({
                                  id: member.id,
                                  name: member.userName || member.userEmail,
                                })
                              }
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Remove member confirmation dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from this
              campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
