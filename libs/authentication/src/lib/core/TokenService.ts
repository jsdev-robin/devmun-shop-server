import { UserRole } from '@server/models';
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

export class TokenService extends CookieService {}
