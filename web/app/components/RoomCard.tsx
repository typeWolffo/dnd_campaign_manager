import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useDeleteRoom } from "../lib/api-hooks";
import { cn } from "~/lib/utils";

interface Room {
  id: string;
  name: string;
  description?: string | null;
  gmId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: string | null;
  isGM?: boolean;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    userName?: string | null;
    userEmail: string;
  }>;
}

interface RoomCardProps {
  room: Room;
  currentUserId: string;
  onViewDetails: (roomId: string) => void;
}

export function RoomCard({ room, currentUserId, onViewDetails }: RoomCardProps) {
  const deleteRoom = useDeleteRoom();
  const isGM = room.gmId === currentUserId;

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${room.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteRoom.mutateAsync(room.id);
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    }
  };

  const memberCount = room.members?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {room.description && (
              <CardDescription className="line-clamp-2">{room.description}</CardDescription>
            )}
          </div>
          <Badge variant={isGM ? "default" : "secondary"} className="ml-2">
            {isGM ? "GM" : "Player"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Members preview */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {room.members?.slice(0, 3).map(member => (
                <Avatar
                  key={member.id}
                  className={cn("h-8 w-8 border-2 border-background", {
                    "bg-accent before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-accent/50":
                      member.role === "gm",
                  })}
                >
                  <AvatarFallback
                    className={cn("text-xs relative", {
                      "bg-primary": member.role === "gm",
                    })}
                  >
                    {(member.userName || member.userEmail).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{memberCount - 3}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {memberCount} player{memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Created {new Date(room.createdAt).toLocaleDateString()}
            </span>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(room.id)}>
                View Details
              </Button>
              {isGM && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteRoom.isPending}
                >
                  {deleteRoom.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
