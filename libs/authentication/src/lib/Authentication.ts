import { IUser } from '@server/models';
import { AuthEngine } from './core/AuthEngine.js';

export class AuthGuard<T extends IUser> extends AuthEngine {}
