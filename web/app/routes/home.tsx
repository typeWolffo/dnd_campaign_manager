import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useSession } from "../lib/auth-client";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "D&D Campaign Manager" },
    { name: "description", content: "Manage your D&D campaigns with Obsidian integration" },
  ];
}

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/95">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            D&D Campaign Manager
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create immersive D&D campaigns with seamless Obsidian integration. Share your
            world-building notes with players while keeping secrets hidden.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
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
    </div>
  );
}
