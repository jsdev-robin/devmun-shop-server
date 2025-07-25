import { Seller } from '../models/userSchema';
import AuthServices from '../services/auth/AuthServices';
import {
  accessCookieExp,
  cookieOptions,
  enableSignature,
  refreshCookieExp,
} from '../services/auth/particles/CookieService';
import { AuthServiceOptions } from '../services/auth/types/authTypes';
import { IUser } from '../types/user';

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

const authControllerHub = new AuthServices<IUser>(options);

export default authControllerHub;
