import { useEffect, useState } from "react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router";
import { NotesSection } from "~/components/NotesSection";
import { Members } from "~/components/Room/Members";
import { RoomDetails } from "~/components/Room/RoomDetails";
import { cn } from "~/lib/utils";
import { ApiTokensSection } from "../components/ApiTokensSection";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../components/animate-ui/radix/tabs";
import { useRemoveMember, useRoom } from "../lib/api-hooks";
import { useSession } from "../lib/auth-client";
import { useRoomWebSocket } from "../lib/use-websocket";
import type { Route } from "./+types/room-details";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
  if (!params.roomId) {
    redirect("/dashboard");
  }

  return { roomId: params.roomId };
};

export default function RoomDetailsPage() {
  const { roomId } = useLoaderData<typeof clientLoader>();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: room, isLoading: roomLoading, error: roomError } = useRoom(roomId);
  const { status: wsStatus, isConnected } = useRoomWebSocket(roomId);
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
    console.error(roomError);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" asChild>
                <Link to="/dashboard">← Back</Link>
              </Button>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant={isGM ? "default" : "secondary"}>
                    {isGM ? "Game Master" : "Player"}
                  </Badge>
                </div>
                <div
                  className={cn("h-1.5 w-1.5 rounded-full relative", {
                    "bg-green-500 before:absolute before:inset-0 before:bg-green-500 before:rounded-full before:animate-ping before:scale-125 before:duration-2000":
                      isConnected,
                    "bg-red-500 before:absolute before:inset-0 before:bg-red-500 before:rounded-full before:animate-ping before:scale-125 before:duration-2000":
                      !isConnected,
                    "bg-yellow-400 before:absolute before:inset-0 before:bg-yellow-400 before:rounded-full before:animate-ping before:duration-2000":
                      wsStatus === "connecting",
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 rounded-t-2xl h-full">
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Notes</TabsTrigger>
            <TabsTrigger value="tab2">Room Details</TabsTrigger>
            <TabsTrigger value="tab3">Members</TabsTrigger>
            <TabsTrigger value="tab4">API Tokens</TabsTrigger>
          </TabsList>
          <TabsContents>
            <TabsContent value="tab1">
              <NotesSection roomId={roomId} isGM={isGM} />
            </TabsContent>
            <TabsContent value="tab2">
              <RoomDetails room={room} />
            </TabsContent>
            <TabsContent value="tab3">
              <Members room={room} onRemoveMember={setMemberToRemove} />
            </TabsContent>
            <TabsContent value="tab4">
              <ApiTokensSection isGM={isGM} />
            </TabsContent>
          </TabsContents>
        </Tabs>
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
