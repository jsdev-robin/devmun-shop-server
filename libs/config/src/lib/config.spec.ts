import { config } from './config.js';

describe('config', () => {
  it('should be defined and contain NODE_ENV', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config).toHaveProperty('NODE_ENV');
  });

  it('should default to development NODE_ENV if not set', () => {
    expect(config.NODE_ENV).toBeDefined();
    expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
  });
});
