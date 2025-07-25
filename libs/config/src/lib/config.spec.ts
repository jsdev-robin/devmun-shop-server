import { config } from './config.js';

describe('config', () => {
  it('should contain the expected configuration properties', () => {
    expect(config).toHaveProperty('NODE_ENV');
    expect(config).toHaveProperty('PORT');
    expect(config).toHaveProperty('DB');
    expect(config).toHaveProperty('ISPRODUCTION');

    expect(typeof config.PORT).toBe('string');
    expect(typeof config.ISPRODUCTION).toBe('boolean');
  });
});
