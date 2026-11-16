import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RayfinClientService } from './RayfinClientService';

const mocks = vi.hoisted(() => ({
  resolveConfig: vi.fn(),
  create: vi.fn(),
  dispose: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@microsoft/rayfin-client', () => ({
  resolveRayfinConfig: mocks.resolveConfig,
  RayfinClient: { create: mocks.create },
}));

describe('RayfinClientService SDK 2 composition', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.create.mockReturnValue({
      dispose: mocks.dispose,
      auth: { signOut: mocks.signOut },
    });
    mocks.resolveConfig.mockResolvedValue({
      baseUrl: '',
      publishableKey: 'pk-test',
      runtimeConfig: { apiUrl: '', publishableKey: 'pk-test' },
    });
  });

  afterEach(() => RayfinClientService.reset());

  it('accepts a resolved same-origin URL and retains the managed auth/data factories', async () => {
    const service = RayfinClientService.getInstance();
    const client = await service.initialize();

    expect(await service.initialize()).toBe(client);
    expect(mocks.resolveConfig).toHaveBeenCalledTimes(1);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      baseUrl: '',
      publishableKey: 'pk-test',
      auth: expect.any(Function),
      services: { data: expect.any(Function) },
    }));
  });

  it.each([
    { baseUrl: undefined, publishableKey: 'pk-test' },
    { baseUrl: '', publishableKey: '  ' },
  ])('rejects incomplete resolved configuration: %j', async (config) => {
    mocks.resolveConfig.mockResolvedValue({ ...config, runtimeConfig: {} });

    await expect(RayfinClientService.getInstance().initialize())
      .rejects.toThrow('Rayfin configuration is incomplete.');
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('disposes the owned client without signing out when reset', async () => {
    await RayfinClientService.getInstance().initialize();

    RayfinClientService.reset();
    RayfinClientService.reset();

    expect(mocks.dispose).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(() => RayfinClientService.getInstance().getClient()).toThrow('not initialized');
  });
});
