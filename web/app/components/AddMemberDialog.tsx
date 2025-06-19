import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useSearchUsers, useAddMember } from "../lib/api-hooks";

interface AddMemberDialogProps {
  roomId: string;
  existingMembers: Array<{
    id: string;
    userId: string;
    userEmail: string;
    userName: string | null;
  }>;
}

type User = { id: string; name: string | null; email: string };

export function AddMemberDialog({ roomId, existingMembers }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: searchResults = [], isLoading } = useSearchUsers(searchTerm);

  const addMemberMutation = useAddMember(roomId);

  const existingMemberIds = new Set(existingMembers.map(m => m.userId));
  const selectedUserIds = new Set(selectedUsers.map(u => u.id));

  const availableUsers = searchResults.filter(
    user => !existingMemberIds.has(user.id) && !selectedUserIds.has(user.id)
  );

  const handleSelectUser = (userId: string) => {
    const user = searchResults.find(u => u.id === userId);
    if (user && !selectedUsers.find(u => u.id === userId)) {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddMembers = async () => {
    const promises = selectedUsers.map(user =>
      addMemberMutation.mutateAsync({ email: user.email, role: "player" })
    );

    await Promise.all(promises);
    setSelectedUsers([]);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members to Room</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          <Command className="rounded-lg border shadow-md h-64" shouldFilter={false}>
            <CommandInput
              placeholder="Search users by email (min 3 chars)..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? "Searching..." : "No users found."}</CommandEmpty>
              <CommandGroup>
                {availableUsers.map(user => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user.id)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{user.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {selectedUsers.length > 0 && (
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Selected members:</p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedUsers.map(user => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    {user.name || user.email}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || addMemberMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
