import { security } from './security.js';

describe('security', () => {
  it('should work', () => {
    expect(security()).toEqual('security');
  });
});
