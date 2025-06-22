import { Notice, requestUrl } from 'obsidian';
import { CampaignSettings, Room, PublishedNote } from './types';

export class CampaignAPI {
  private settings: CampaignSettings;
  private sessionCookie: string | null = null;

  constructor(settings: CampaignSettings) {
    this.settings = settings;
  }

  updateSettings(settings: CampaignSettings) {
    this.settings = settings;
  }

  private async makeRequest(path: string, options: RequestInit = {}) {
    const url = `${this.settings.apiUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers),
    };

    if (this.sessionCookie) {
      // @ts-expect-error - Cookie is not a valid property of HeadersInit
      headers.Cookie = this.sessionCookie;
    }

    try {
      const response = await requestUrl({
        url,
        method: options.method,
        // @ts-expect-error - HeadersInit is not a valid property of requestUrl
        headers,
        body: options.body as string,
      });

      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        this.sessionCookie = setCookie;
      }

      return response.json;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async makeFormDataRequest(path: string, formData: FormData): Promise<any> {
    const url = `${this.settings.apiUrl}${path}`;

    const headers: HeadersInit = {};

    if (this.sessionCookie) {
      headers['Cookie'] = this.sessionCookie;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.sessionCookie = setCookie;
      }

      new Notice('bbbbbbbbbb ' + response);

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error('FormData request failed:', error);
      new Notice('aaaaaaaaa ' + error);
      throw error;
    }
  }

  async login(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/auth/sign-in/email', {
        method: 'POST',
        body: JSON.stringify({
          email: this.settings.email,
          password: this.settings.password,
        }),
      });

      if (response.user) {
        new Notice('Successfully logged in to Campaign Manager');
        return true;
      }

      return false;
    } catch (error) {
      new Notice('Login failed: ' + error.message);
      return false;
    }
  }

  async getRooms(): Promise<Room[]> {
    try {
      const rooms = await this.makeRequest('/rooms/');
      return rooms || [];
    } catch (error) {
      new Notice('Failed to fetch rooms: ' + error.message);
      return [];
    }
  }

  async publishNote(roomId: string, noteData: any): Promise<any> {
    try {
      const result = await this.makeRequest(`/rooms/${roomId}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });

      return result;
    } catch (error) {
      new Notice('Failed to publish note: ' + error.message);
      throw error;
    }
  }

  async getPublishedNotes(roomId: string): Promise<PublishedNote[]> {
    try {
      const notes = await this.makeRequest(`/rooms/${roomId}/notes`);
      return notes || [];
    } catch (error) {
      new Notice('Failed to fetch published notes: ' + error.message);
      return [];
    }
  }

  async deleteNote(roomId: string, noteId: string): Promise<void> {
    try {
      await this.makeRequest(`/rooms/${roomId}/notes/${noteId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      new Notice('Failed to delete note: ' + error.message);
      throw error;
    }
  }

  async uploadImage(roomId: string, noteId: string, formData: FormData): Promise<any> {
    return await this.makeFormDataRequest(`/images/upload/${roomId}/${noteId}`, formData);
  }

  async getExistingImages(roomId: string, noteId: string): Promise<any> {
    try {
      return await this.makeRequest(`/images/${roomId}/${noteId}`);
    } catch (error) {
      // If note doesn't exist yet or no images, return empty array
      return { images: [] };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}
