import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useSession } from "../lib/auth-client";
import { useLastRoom } from "../lib/use-last-room";
import { useRooms } from "../lib/api-hooks";
import { useEffect } from "react";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Grymlore | Campaign Manager" },
    {
      name: "description",
      content: "Create immersive D&D campaigns with seamless Obsidian integration",
    },
  ];
}

export default function Home() {
  const { data: session } = useSession();
  const { data: rooms } = useRooms();
  const { lastRoomId } = useLastRoom();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && rooms) {
      if (lastRoomId && rooms.some(room => room.id === lastRoomId)) {
        navigate(`/rooms/${lastRoomId}`);
      } else if (rooms.length > 0) {
        navigate(`/rooms/${rooms[0].id}`);
      }
    }
  }, [session, rooms, lastRoomId, navigate]);

  return (
    <div className="min-h-screen bg-dungeon-gradient">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-arcane-glow mb-6">Grymlore</h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create immersive D&D campaigns with seamless Obsidian integration. Share your
            world-building notes with players while keeping secrets hidden.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session && (
              <>
                <Button asChild size="lg">
                  <Link to="/sign-up">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                🎲 Campaign Rooms
              </CardTitle>
              <CardDescription>
                Create private rooms for your campaigns and invite players via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organize your campaigns with dedicated spaces for each adventure. Manage player
                access and permissions easily.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                📝 Obsidian Integration
              </CardTitle>
              <CardDescription>
                Publish portions of your notes using [PUBLIC] markers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep your DM secrets while sharing world lore, NPCs, and locations with your players
                seamlessly.
              </p>
            </CardContent>
          </Card>
          {/*
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">👥 Player Management</CardTitle>
              <CardDescription>Invite players and control what they can see</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Send email invitations and manage player permissions. Perfect for both in-person and
                remote campaigns.
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Call to Action */}
        {!session && (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Ready to start?</CardTitle>
                <CardDescription>Join thousands of DMs already using our platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/sign-up">Create Free Account</Link>
                </Button>
                <p className="text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="underline">
                    Sign in here
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <footer className="text-center text-sm text-muted-foreground py-4">
        <p>
          <Link to="/faq" className="underline">
            FAQ
          </Link>
        </p>
      </footer>
    </div>
  );
}
