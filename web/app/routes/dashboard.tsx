import { useSession, signOut } from "../lib/auth-client";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CreateRoomDialog } from "../components/CreateRoomDialog";
import { RoomCard } from "../components/RoomCard";
import { useRooms } from "../lib/api-hooks";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useRooms();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/sign-in");
    }
  }, [session, isPending, navigate]);

  const handleViewRoomDetails = (roomId: string) => {
    navigate(`/rooms/${roomId}`);
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/sign-in");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="hidden md:flex items-center">
              <h1 className="text-2xl font-bold text-foreground">D&D Campaign Manager</h1>
            </div>
            <div className="flex items-center space-x-4 justify-between grow md:grow-0">
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user.name || session.user.email}!
              </span>
              <Button variant="secondary" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {session.user.name || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {session.user.email}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {session.user.id}
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Card */}
            <Card>
              <CardHeader>
                <CardTitle>My Campaigns</CardTitle>
                <CardDescription>Campaigns you're running or playing in</CardDescription>
              </CardHeader>
              <CardContent>
                {roomsLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading campaigns...</div>
                ) : roomsError ? (
                  <div className="text-center py-4 text-red-500">Failed to load campaigns</div>
                ) : !rooms || rooms.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No campaigns yet. Create your first campaign to get started!
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-600">
                    {rooms.length} campaign{rooms.length !== 1 ? "s" : ""}
                  </div>
                )}
                <CreateRoomDialog>
                  <Button className="w-full">Create Campaign</Button>
                </CreateRoomDialog>
              </CardContent>
            </Card>
          </div>

          {rooms && rooms.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">All Campaigns</h2>
                <p className="text-gray-600">Manage your campaigns and view details</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    currentUserId={session.user.id}
                    onViewDetails={handleViewRoomDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
