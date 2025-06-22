// PWA utilities
export const isPWASupported = (): boolean => {
  return "serviceWorker" in navigator && "PushManager" in window;
};

export const isStandalone = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPWASupported()) {
    console.info("PWA not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.info("Service Worker registered successfully:", registration);

    // Handle updates - better detection
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New version available, show update prompt
              console.info("New version available!");
              showUpdatePrompt();
            } else {
              // First install
              console.info("App is ready for offline use");
            }
          }
        });
      }
    });

    // Check for updates every 30 seconds when app is active
    setInterval(() => {
      if (document.visibilityState === "visible") {
        registration.update();
      }
    }, 30000);

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isPWASupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.info("Service Worker unregistered:", result);
    return result;
  } catch (error) {
    console.error("Service Worker unregistration failed:", error);
    return false;
  }
};

const showUpdatePrompt = () => {
  // Show update notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("D&D Campaign Manager Update", {
      body: "A new version is available. Click to refresh.",
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      tag: "app-update",
    });
  }

  // Show in-app update prompt
  const shouldUpdate = confirm(
    "New version available! Refresh to get the latest features and fixes?"
  );

  if (shouldUpdate) {
    // Force refresh to get new version
    window.location.reload();
  }
};

// Force update service worker
export const forceUpdateServiceWorker = async (): Promise<void> => {
  if (!isPWASupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Skip waiting and activate new service worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    // Refresh page to use new service worker
    window.location.reload();
  } catch (error) {
    console.error("Force update failed:", error);
  }
};

export const requestNotificationPermission = async (): Promise<
  "granted" | "denied" | "default"
> => {
  if (!("Notification" in window)) {
    console.info("This browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

// Install prompt handling
let deferredPrompt: any = null;

export const handleInstallPrompt = () => {
  window.addEventListener("beforeinstallprompt", e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    console.info("PWA was installed");
    hideInstallButton();
    deferredPrompt = null;
  });
};

export const triggerInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.info(`User response to the install prompt: ${outcome}`);

  // Clear the prompt
  deferredPrompt = null;

  return outcome === "accepted";
};

const showInstallButton = () => {
  // Dispatch custom event to show install button in UI
  window.dispatchEvent(new CustomEvent("pwa-install-available"));
};

const hideInstallButton = () => {
  // Dispatch custom event to hide install button in UI
  window.dispatchEvent(new CustomEvent("pwa-install-completed"));
};

// iOS specific PWA detection
export const isIOSPWA = (): boolean => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isStandalone() && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
};

// Check if running on iOS
export const isIOS = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Add to home screen instruction for iOS
export const showIOSInstallInstructions = () => {
  if (isIOS() && !isStandalone()) {
    // Show iOS specific install instructions
    console.info("Show iOS install instructions");
    window.dispatchEvent(new CustomEvent("pwa-ios-install-instructions"));
  }
};

export const initializePWA = async () => {
  // Register service worker
  await registerServiceWorker();

  // Handle install prompt
  handleInstallPrompt();

  // Request notification permission (optional)
  // await requestNotificationPermission();

  // Show iOS instructions if needed
  showIOSInstallInstructions();
};
