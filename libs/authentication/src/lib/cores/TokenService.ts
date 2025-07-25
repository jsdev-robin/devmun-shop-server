import { UserRole } from '@server/models';
import { IAuthCookies } from '../types/authTypes.js';
import { CookieService } from './CookieService.js';

export interface TokenSignature {
  ip: string;
  browser: string;
  device: string;
  id: string;
  role: UserRole;
  remember: boolean;
  token: string;
}

export class TokenService extends CookieService {
  constructor(options: { cookies: IAuthCookies }) {
    super(options);
  }
}
