import { AuthUser } from '../interfaces/IAuthService';
import {
  ensureSignedInWithFabric,
  initiateFabricLogin,
  initEmbeddedAuth,
  signInWithBrokeredToken,
} from '@microsoft/rayfin-auth-provider-fabric';

import { getRayfinClient } from './RayfinClientService';

export interface FabricAuthConfig {
  workspaceId: string;
  projectId: string;
  fabricPortalUrl: string;
}

export class RayfinFabricAuthService {
  private readonly config: FabricAuthConfig;

  constructor(config: FabricAuthConfig) {
    this.config = config;
  }

  async initEmbeddedAuth(): Promise<AuthUser | null> {
    const client = getRayfinClient();

    let session = await initEmbeddedAuth(client.auth, {
      workspaceId: this.config.workspaceId,
      projectId: this.config.projectId,
      fabricPortalUrl: this.config.fabricPortalUrl,
      returnOrigin: window.location.origin,
    });

    if (!session) {
      const currentSession = client.auth.getSession();
      if (currentSession.isAuthenticated && !currentSession.isAnonymous) {
        session = currentSession;
      } else {
        if (currentSession.isAnonymous) await client.auth.signOut();
        if (client.auth.hasRefreshToken()) {
          try {
            await client.auth.refreshSession();
            const refreshed = client.auth.getSession();
            if (refreshed.isAuthenticated && !refreshed.isAnonymous) {
              session = refreshed;
            }
          } catch (error) {
            console.warn('Stored session could not be refreshed. Sign in again.', error);
          }
        }
      }
    }

    if (!session && import.meta.env.DEV) {
      const localDev = await import('@microsoft/rayfin-local-dev');
      if (localDev.isRayfinLocalAutoLoginEnabled()) {
        const token = await localDev.fetchRayfinLocalSessionToken();
        if (!token) {
          throw new Error(
            'Local automatic sign-in is enabled, but no session token was returned.'
          );
        }
        session = await signInWithBrokeredToken(client.auth, token);
      }
    }

    if (!session?.isAuthenticated || session.isAnonymous || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.email.split('@')[0],
    };
  }

  async initiateFabricLogin(): Promise<void> {
    const client = getRayfinClient();

    await initiateFabricLogin(client.auth, {
      workspaceId: this.config.workspaceId,
      projectId: this.config.projectId,
      fabricPortalUrl: this.config.fabricPortalUrl,
      returnOrigin: window.location.origin,
    });
  }

  async ensureSignedInWithFabric(): Promise<AuthUser> {
    if (import.meta.env.DEV) {
      const localDev = await import('@microsoft/rayfin-local-dev');
      if (localDev.isRayfinLocalAutoLoginEnabled()) {
        const user = await this.initEmbeddedAuth();
        if (!user) {
          throw new Error('Local automatic sign-in did not establish a user session.');
        }
        return user;
      }
    }

    const client = getRayfinClient();

    const session = await ensureSignedInWithFabric(client.auth, {
      workspaceId: this.config.workspaceId,
      projectId: this.config.projectId,
      fabricPortalUrl: this.config.fabricPortalUrl,
      returnOrigin: window.location.origin,
    });

    if (!session.isAuthenticated || session.isAnonymous || !session.user) {
      throw new Error(
        'Fabric authentication completed but no session was established.'
      );
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.email.split('@')[0],
    };
  }
}
