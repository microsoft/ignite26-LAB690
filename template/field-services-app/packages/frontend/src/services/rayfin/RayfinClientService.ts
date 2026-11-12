import { RayfinClient, resolveRayfinConfig } from '@microsoft/rayfin-client';
import type { FieldServiceSchema } from '@field-services/shared';

/**
 * A singleton service that manages the RayfinClient instance
 */
export class RayfinClientService {
  private static instance: RayfinClientService | null = null;
  private _client: RayfinClient<FieldServiceSchema> | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of RayfinClientService
   */
  public static getInstance(): RayfinClientService {
    if (!RayfinClientService.instance) {
      RayfinClientService.instance = new RayfinClientService();
    }
    return RayfinClientService.instance;
  }

  public async initialize(): Promise<RayfinClient<FieldServiceSchema>> {
    if (!this._client) {
      const resolved = await resolveRayfinConfig({
        apiUrl: import.meta.env.VITE_RAYFIN_API_URL,
        publishableKey: import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY,
        workspaceId: import.meta.env.VITE_FABRIC_WORKSPACE_ID,
        itemId: import.meta.env.VITE_FABRIC_ITEM_ID,
        portalUrl: import.meta.env.VITE_FABRIC_PORTAL_URL,
      });
      if (!resolved.baseUrl || !resolved.publishableKey) {
        throw new Error(
          'Rayfin configuration is incomplete. Deploy with npm run rayfin:up, then restart npm run dev.'
        );
      }

      this._client = new RayfinClient<FieldServiceSchema>({
        baseUrl: resolved.baseUrl,
        publishableKey: resolved.publishableKey,
        runtimeConfig: resolved.runtimeConfig,
        authStorage: true,
      });
    }

    return this._client;
  }

  /**
   * Get the RayfinClient instance
   * @throws Error if the client is not initialized
   */
  public getClient(): RayfinClient<FieldServiceSchema> {
    if (!this._client) {
      throw new Error('RayfinClient not initialized. Call initialize() first.');
    }
    return this._client;
  }

  /**
   * Check if the client is initialized
   */
  public isInitialized(): boolean {
    return this._client !== null;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    RayfinClientService.instance = null;
  }
}

/**
 * Helper function to get the RayfinClient instance
 * @throws Error if the client is not initialized
 */
export function getRayfinClient(): RayfinClient<FieldServiceSchema> {
  return RayfinClientService.getInstance().getClient();
}
