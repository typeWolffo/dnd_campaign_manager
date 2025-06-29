import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Session {
  user: User;
  token: string;
}

const getApiUrl = () => {
  if (__DEV__) {
    const { expoConfig } = Constants;
    const debuggerHost = expoConfig?.hostUri;
    const localIp = debuggerHost?.split(':')[0];
    return `http://${localIp || 'localhost'}:4000`;
  } else {
    return process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
  }
};

class AuthClient {
  private session: Session | null = null;
  private apiUrl = getApiUrl();

  async getSession(): Promise<Session | null> {
    if (this.session) return this.session;

    try {
      const sessionData = await AsyncStorage.getItem('session');
      if (sessionData) {
        this.session = JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Failed to get session:', error);
    }

    return this.session;
  }

  async signIn(email: string, password: string): Promise<Session> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('Sign in response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sign in failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Sign in failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sign in response data:', data);

      // Better Auth returns session data differently
      const session = {
        user: data.user,
        token: data.session?.id || 'session-token'
      };

      this.session = session;
      await AsyncStorage.setItem('session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(name: string, email: string, password: string): Promise<Session> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      console.log('Sign up response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sign up failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Sign up failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sign up response data:', data);

      // Better Auth returns session data differently
      const session = {
        user: data.user,
        token: data.session?.id || 'session-token'
      };

      this.session = session;
      await AsyncStorage.setItem('session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.session = null;
      await AsyncStorage.removeItem('session');
    }
  }
}

export const authClient = new AuthClient();

// React hooks for auth
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error('Failed to load session:', error);
        setSession(null);
      } finally {
        setIsPending(false);
      }
    };

    loadSession();
  }, []);

  return {
    data: session,
    isPending,
  };
};

export const signIn = {
  email: async (data: { email: string; password: string }, options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    try {
      await authClient.signIn(data.email, data.password);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error);
    }
  }
};

export const signUp = {
  email: async (data: { name: string; email: string; password: string }, options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    try {
      await authClient.signUp(data.name, data.email, data.password);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error);
    }
  }
};

export const signOut = async (options?: {
  fetchOptions?: {
    onSuccess?: () => void;
  };
}) => {
  try {
    await authClient.signOut();
    options?.fetchOptions?.onSuccess?.();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
