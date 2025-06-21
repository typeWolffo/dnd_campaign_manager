import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X, Download, Share } from "lucide-react";
import { triggerInstallPrompt, isIOS, isStandalone } from "../lib/pwa";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem("pwa-install-dismissed") === "true";
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Check if already installed
    if (isStandalone()) {
      return;
    }

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    const handleInstallCompleted = () => {
      setShowPrompt(false);
      setShowIOSInstructions(false);
    };

    const handleIOSInstructions = () => {
      setShowIOSInstructions(true);
    };

    window.addEventListener("pwa-install-available", handleInstallAvailable);
    window.addEventListener("pwa-install-completed", handleInstallCompleted);
    window.addEventListener("pwa-ios-install-instructions", handleIOSInstructions);

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallAvailable);
      window.removeEventListener("pwa-install-completed", handleInstallCompleted);
      window.removeEventListener("pwa-ios-install-instructions", handleIOSInstructions);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await triggerInstallPrompt();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if dismissed or already standalone
  if (dismissed || isStandalone()) {
    return null;
  }

  // Show iOS instructions
  if (showIOSInstructions && isIOS()) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Install D&D Manager</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Add this app to your home screen for easy access
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Share className="h-4 w-4 text-blue-500" />
              <span>1. Tap the Share button</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-[8px]">+</span>
              </div>
              <span>2. Tap "Add to Home Screen"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-primary rounded flex items-center justify-center">
                <span className="text-[8px] text-white">✓</span>
              </div>
              <span>3. Tap "Add" to install</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show regular install prompt
  if (showPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Install D&D Manager</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Install the app for offline access and better performance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1">
              Not now
            </Button>
            <Button size="sm" onClick={handleInstall} className="flex-1">
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
