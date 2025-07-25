import { email } from './email.js';

describe('email', () => {
  it('should work', () => {
    expect(email()).toEqual('email');
  });
});
