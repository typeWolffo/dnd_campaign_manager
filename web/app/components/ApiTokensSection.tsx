import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Trash2, Copy, Plus, Eye, EyeOff } from "lucide-react";
import { useApiTokens, useCreateApiToken, useDeleteApiToken } from "../lib/api-hooks";

interface ApiTokensSectionProps {
  isGM: boolean;
}

export function ApiTokensSection({ isGM }: ApiTokensSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const { data: tokens, isLoading } = useApiTokens();
  const createToken = useCreateApiToken();
  const deleteToken = useDeleteApiToken();

  if (!isGM) {
    return null;
  }

  const handleCreateToken = async () => {
    if (!tokenName.trim()) return;

    try {
      const result = await createToken.mutateAsync({
        name: tokenName.trim(),
        permissions: ["read", "write"],
      });

      if (result?.tokenValue) {
        setNewTokenValue(result.tokenValue);
        setTokenName("");
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error("Failed to create token:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🔑 API Tokens
                <Badge variant="secondary" className="text-xs">
                  GM Only
                </Badge>
              </CardTitle>
              <CardDescription>Manage API tokens for Obsidian plugin integration</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Token</DialogTitle>
                  <DialogDescription>
                    Create a new API token for the Obsidian plugin.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tokenName">Token Name</Label>
                    <Input
                      id="tokenName"
                      value={tokenName}
                      onChange={e => setTokenName(e.target.value)}
                      placeholder="e.g., Obsidian Plugin"
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateToken}
                    disabled={!tokenName.trim() || createToken.isPending}
                  >
                    {createToken.isPending ? "Creating..." : "Create Token"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading tokens...</div>
          ) : tokens?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🔑</div>
              <p className="text-sm">No API tokens yet</p>
              <p className="text-xs">Create one to connect the Obsidian plugin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens?.map((token: any) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created: {formatDate(token.createdAt)}
                      {token.lastUsedAt && (
                        <span className="ml-4">Last used: {formatDate(token.lastUsedAt)}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {token.permissions?.map((permission: string) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm(`Delete token "${token.name}"?`)) {
                          deleteToken.mutate(token.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {newTokenValue && (
        <Dialog open={!!newTokenValue} onOpenChange={() => setNewTokenValue(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>🎉 API Token Created!</DialogTitle>
              <DialogDescription>Copy your new token - it won't be shown again.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Your API Token</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {showToken ? newTokenValue : "•".repeat(20) + newTokenValue?.slice(-8)}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowToken(!showToken)}>
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newTokenValue)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How to use in Obsidian:</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Open Obsidian Settings → D&D Campaign Manager</li>
                  <li>2. Paste this token in the "API Token" field</li>
                  <li>3. Test the connection</li>
                  <li>4. Start publishing with [PUBLIC] markers!</li>
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewTokenValue(null)}>I've Saved the Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
