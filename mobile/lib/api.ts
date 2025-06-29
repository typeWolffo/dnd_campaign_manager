import Constants from 'expo-constants';

// Determine API URL based on environment
const getApiUrl = () => {
  if (__DEV__) {
    // Development - use your local IP
    const { expoConfig } = Constants;
    const debuggerHost = expoConfig?.hostUri;
    const localIp = debuggerHost?.split(':')[0];
    return `http://${localIp || 'localhost'}:4000`;
  } else {
    // Production
    return process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
  }
};

const baseUrl = getApiUrl();

// Simple fetch-based API client
export const apiClient = {
  api: {
    rooms: {
      get: async () => {
        try {
          const response = await fetch(`${baseUrl}/api/rooms`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            return { error: true, data: null };
          }

          const data = await response.json();
          return { error: false, data };
        } catch (error) {
          console.error('API Error:', error);
          return { error: true, data: null };
        }
      },
      post: async (roomData: any) => {
        try {
          const response = await fetch(`${baseUrl}/api/rooms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(roomData),
          });

          if (!response.ok) {
            return { error: true, data: null };
          }

          const data = await response.json();
          return { error: false, data };
        } catch (error) {
          console.error('API Error:', error);
          return { error: true, data: null };
        }
      },
    },
  },
};
