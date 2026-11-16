import { RayfinClient, resolveRayfinConfig, type RayfinRuntimeConfig } from '@microsoft/rayfin-client';
import { browserSession } from '@microsoft/rayfin-auth';
import { dataService } from '@microsoft/rayfin-data';
import type { FieldServiceSchema } from '@field-services/shared';

function createClient(baseUrl: string, publishableKey: string, runtimeConfig: RayfinRuntimeConfig) {
  return RayfinClient.create({
    baseUrl,
    publishableKey,
    runtimeConfig,
    auth: browserSession({ storage: true }),
    services: { data: dataService<FieldServiceSchema>() },
  });
}

type FieldServiceClient = ReturnType<typeof createClient>;

/**
 * A singleton service that manages the RayfinClient instance
 */
export class RayfinClientService {
  private static instance: RayfinClientService | null = null;
  private _client: FieldServiceClient | null = null;

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

  public async initialize(): Promise<FieldServiceClient> {
    if (!this._client) {
      const resolved = await resolveRayfinConfig({
        apiUrl: import.meta.env.VITE_RAYFIN_API_URL,
        publishableKey: import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY,
        workspaceId: import.meta.env.VITE_FABRIC_WORKSPACE_ID,
        itemId: import.meta.env.VITE_FABRIC_ITEM_ID,
        portalUrl: import.meta.env.VITE_FABRIC_PORTAL_URL,
      });
      if (typeof resolved.baseUrl !== 'string' || !resolved.publishableKey?.trim()) {
        throw new Error(
          'Rayfin configuration is incomplete. Deploy with npm run rayfin:up, then restart npm run dev.'
        );
      }

      this._client = createClient(
        resolved.baseUrl,
        resolved.publishableKey,
        resolved.runtimeConfig
      );
    }

    return this._client;
  }

  /**
   * Get the RayfinClient instance
   * @throws Error if the client is not initialized
   */
  public getClient(): FieldServiceClient {
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
    RayfinClientService.instance?._client?.dispose();
    RayfinClientService.instance = null;
  }
}

/**
 * Helper function to get the RayfinClient instance
 * @throws Error if the client is not initialized
 */
export function getRayfinClient(): FieldServiceClient {
  return RayfinClientService.getInstance().getClient();
}
