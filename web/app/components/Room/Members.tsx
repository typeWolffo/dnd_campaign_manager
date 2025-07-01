import { AvatarFallback } from "../ui/avatar";
import { Trash2 } from "lucide-react";
import { AddMemberDialog } from "../AddMemberDialog";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import type { GetApiRoomsData } from "~/api/data-contracts";
import { Avatar } from "../ui/avatar";
import { Badge } from "../ui/badge";

type MembersProps = {
  room: GetApiRoomsData[number];
  onRemoveMember: (member: { id: string; name: string }) => void;
};

export const Members = ({ room, onRemoveMember }: MembersProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members ({room.members?.length || 0})</CardTitle>
          {room.isGM && <AddMemberDialog roomId={room.id} existingMembers={room.members || []} />}
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
                <Badge variant={member.role === "gm" ? "default" : "secondary"} className="text-xs">
                  {member.role?.toUpperCase()}
                </Badge>
                {room.isGM && member.role !== "gm" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onRemoveMember({
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
  );
};
