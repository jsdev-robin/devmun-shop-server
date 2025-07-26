import { AuthGuard } from '@server/authentication';
import { IUser, Seller } from '@server/models';
import { AuthService } from '../services/auth/AuthService';

const authControllerHub = new AuthService<IUser>({
  model: Seller,
  role: 'seller',
});

const authGuard = new AuthGuard({
  model: Seller,
});

export { authControllerHub, authGuard };
