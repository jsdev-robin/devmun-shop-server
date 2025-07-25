import {
  accessCookieExp,
  Authentication,
  AuthServiceOptions,
  cookieOptions,
  enableSignature,
  refreshCookieExp,
} from '@server/authentication';
import { IUser, Seller } from '@server/models';

const options: AuthServiceOptions<IUser> = {
  model: Seller,
  cookies: {
    access: {
      name: 'aeuT2k1z9',
      TTL: accessCookieExp,
      options: {
        ...cookieOptions,
        ...enableSignature,
      },
    },
    refresh: {
      name: 'reuT2k1z8',
      TTL: refreshCookieExp,
      options: cookieOptions,
    },
  },
  role: 'seller',
};

const authControllerHub = new Authentication<IUser>(options);

export default authControllerHub;
