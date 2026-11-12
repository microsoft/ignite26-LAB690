import { IAuthService } from './interfaces/IAuthService';
import { IFieldService } from './interfaces/IFieldService';
import { RayfinAuthService } from './rayfin/RayfinAuthService';
import { RayfinClientService } from './rayfin/RayfinClientService';
import { RayfinFieldService } from './rayfin/RayfinFieldService';
import { RayfinPasswordAuthService } from './rayfin/RayfinPasswordAuthService';

function isLocalBackend(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export class ServiceContainer {
  private static instance: ServiceContainer | null = null;

  public readonly authService: IAuthService;
  public readonly fieldService: IFieldService;

  private constructor(authService: IAuthService, fieldService: IFieldService) {
    this.authService = authService;
    this.fieldService = fieldService;
  }

  static async create(): Promise<ServiceContainer> {
    if (!ServiceContainer.instance) {
      const rayfinClientService = RayfinClientService.getInstance();
      const client = await rayfinClientService.initialize();
      const { workspaceId, itemId, portalUrl } = client.runtimeConfig ?? {};
      // The Vite proxy itself is loopback even when the backend is Fabric.
      const localDev = !workspaceId &&
        isLocalBackend(import.meta.env.VITE_RAYFIN_API_URL ?? '');

      let authService: IAuthService;

      if (localDev) {
        authService = new RayfinPasswordAuthService();
      } else {
        if (!workspaceId || !itemId || !portalUrl) {
          throw new Error(
            'Fabric configuration is incomplete: workspaceId, itemId, and portalUrl are required. Deploy with npm run rayfin:up, then restart npm run dev.'
          );
        }

        authService = new RayfinAuthService({
          workspaceId,
          projectId: itemId,
          fabricPortalUrl: portalUrl,
        });
      }

      ServiceContainer.instance = new ServiceContainer(
        authService,
        new RayfinFieldService()
      );
    }

    return ServiceContainer.instance;
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      throw new Error('ServiceContainer not initialized. Call create() first.');
    }
    return ServiceContainer.instance;
  }

  static reset(): void {
    ServiceContainer.instance = null;
    RayfinClientService.reset();
  }
}
