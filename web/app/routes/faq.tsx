import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ExternalLink, Download, Settings, BookOpen, Users, FileText } from "lucide-react";

export default function Faq() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="bg-card shadow">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-4 sm:py-6">
            <Button variant="secondary" asChild className="w-fit">
              <Link to="/">← Back to Home</Link>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Setup Guide & FAQ</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                Getting Started
              </CardTitle>
              <CardDescription className="text-sm">
                Follow these steps to set up your D&D Campaign Manager with Obsidian integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Step 1 */}
                <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge
                      variant="default"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                    >
                      1
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                      Create Your Account
                    </h3>
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
                      Sign up for a free account to start managing your D&D campaigns.
                    </p>
                    <Button asChild variant="default" size="sm" className="text-xs sm:text-sm">
                      <Link to="/sign-up">
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        Sign Up Here
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge
                      variant="default"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                    >
                      2
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                      Download Obsidian Plugin
                    </h3>
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
                      Download the latest version of the D&D Campaign Manager Obsidian plugin from
                      our GitHub releases.
                    </p>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="mb-2 sm:mb-3 text-xs sm:text-sm"
                    >
                      <a
                        href="https://github.com/typeWolffo/dnd_campaign_manager/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        Download Plugin
                      </a>
                    </Button>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Look for{" "}
                      <code className="bg-muted px-1 sm:px-2 py-1 rounded text-foreground text-xs break-all">
                        dnd-campaign-manager-obsidian-plugin.zip
                      </code>
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge
                      variant="default"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                    >
                      3
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                      Install the Plugin
                    </h3>
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
                      Extract the plugin files to your Obsidian vault's plugins directory.
                    </p>
                    <div className="bg-muted p-2 sm:p-3 rounded-md text-xs sm:text-sm text-foreground overflow-x-auto">
                      <code className="font-mono whitespace-nowrap block">
                        &lt;your_vault&gt;/.obsidian/plugins/dnd-campaign-manager/
                      </code>
                    </div>
                    <div className="my-3 text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p>
                        • If the{" "}
                        <code className="bg-muted px-1 rounded text-foreground text-xs break-all">
                          plugins
                        </code>{" "}
                        folder doesn't exist, create it
                      </p>
                      <p>
                        • Create the{" "}
                        <code className="bg-muted px-1 rounded text-foreground text-xs break-all">
                          dnd-campaign-manager
                        </code>{" "}
                        subfolder
                      </p>
                      <p>• Extract all files from the ZIP into this folder</p>
                    </div>

                    <div className="w-full space-y-2 sm:space-y-3">
                      <img
                        src="/images/3.png"
                        alt="Obsidian Settings"
                        className="w-full h-auto rounded object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col gap-3 p-2 sm:p-4 border rounded-lg">
                  <div className="flex gap-2 sm:gap-4">
                    <div className="flex-shrink-0">
                      <Badge
                        variant="default"
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                      >
                        4
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                        Configure in Obsidian
                      </h3>
                      <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
                        Enable the plugin and configure your settings in Obsidian.
                      </p>
                      <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        <p>• Open Obsidian Settings (Ctrl/Cmd + ,)</p>
                        <p>• Go to "Community plugins"</p>
                        <p>• Enable "D&D Campaign Manager"</p>
                        <p>• Configure your API URL and credentials in plugin settings:</p>
                        <div className="ml-2 sm:ml-4 space-y-1">
                          <p> 1. Fill in your email and password credentials</p>
                          <p> 2. Test the connection to verify everything works</p>
                          <p> 3. Your campaign rooms created in the app will appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-2 sm:space-y-3">
                    <img
                      src="/images/1.png"
                      alt="Obsidian Settings"
                      className="w-full h-auto rounded object-contain"
                    />
                    <img
                      src="/images/2.png"
                      alt="Obsidian Settings"
                      className="w-full h-auto rounded object-contain"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                How to Use
              </CardTitle>
              <CardDescription className="text-sm">
                Learn how to manage campaigns and share notes with your players
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">For Game Masters</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create campaign rooms</li>
                    {/* <li>• Invite players via email</li> */}
                    <li>• Mark content as [PUBLIC] to share with players</li>
                    <li>• Keep private notes hidden</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">For Players</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {/* <li>• Join campaigns via invitation</li> */}
                    <li>• View shared campaign notes</li>
                    <li>• Access world lore and NPCs</li>
                    <li>• Stay updated with campaign info</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Note Format
              </CardTitle>
              <CardDescription className="text-sm">
                How to structure your Obsidian notes for publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-2 sm:p-4 rounded-md overflow-x-auto">
                <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                  {`# My Campaign Note

This is private GM content that won't be shared.

[PUBLIC]
This section will be visible to all players in the campaign.
You can include:
- World lore
- NPC descriptions
- Location details
- Public quest information
[!PUBLIC]

More private content here...

[PUBLIC]
Another public section with more player information.
[!PUBLIC]`}
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Only content between{" "}
                <code className="bg-muted px-1 text-foreground rounded">[PUBLIC]</code> and{" "}
                <code className="bg-muted px-1 text-foreground rounded">[!PUBLIC]</code> tags will
                be shared with players.
              </p>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Plugin doesn't appear in Obsidian</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Check that files are in the correct folder structure</li>
                    <li>• Restart Obsidian after installation</li>
                    <li>• Ensure Community plugins are enabled</li>
                    <li>• Verify all plugin files were extracted properly</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Can't connect to campaign manager</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Check your API URL in plugin settings</li>
                    <li>• Verify your email and password are correct</li>
                    <li>• Ensure you have internet connection</li>
                    <li>• Try refreshing your login credentials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Notes not publishing</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Check [PUBLIC] tag formatting</li>
                    <li>• Ensure you're connected to the right campaign</li>
                    <li>• Verify you have GM permissions</li>
                    <li>• Check for any error messages in Obsidian console</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                Get additional support and stay updated with the project
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href="https://github.com/typeWolffo/dnd_campaign_manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub Repository
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href="https://github.com/typeWolffo/dnd_campaign_manager/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Report Issues
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
