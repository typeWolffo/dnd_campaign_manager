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
      'Authorization': `Bearer ${this.settings.apiToken}`,
    };

    try {
      const response = await requestUrl({
        url,
        method: options.method as any || 'GET',
        headers,
        body: options.body as string,
      });

      return response.json;
    } catch (error) {
      console.error('❌ API request failed:', error);
      new Notice(`API request failed: ${error.message}`);
      throw error;
    }
  }

  private async makeFormDataRequest(path: string, formData: FormData): Promise<any> {
    const url = `${this.settings.apiUrl}${path}`;

    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.settings.apiToken}`,
    };

    try {
      // Convert FormData to a format requestUrl can handle
      // For file uploads, we need to use the browser's fetch as requestUrl doesn't support FormData
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error('FormData request failed:', error);
      throw error;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/auth/session');
      return !!response.user;
    } catch (error) {
      new Notice('Invalid API token');
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
      return await this.validateToken();
    } catch (error) {
      return false;
    }
  }
}
