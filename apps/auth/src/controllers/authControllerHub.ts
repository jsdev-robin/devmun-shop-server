import { AuthGuard } from '@server/authentication';
import { IUser, Seller, UserRole } from '@server/models';
import { Model } from 'mongoose';
import { AuthService } from '../services/auth/AuthService';

const payload: { model: Model<IUser>; role: UserRole } = {
  model: Seller,
  role: 'seller',
};

const authControllerHub = new AuthService<IUser>(payload);

const authGuard = new AuthGuard<IUser>(payload);

export { authControllerHub, authGuard };
