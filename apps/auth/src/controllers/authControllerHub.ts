import { IUser, Seller } from '@server/models';
import { AuthService } from '../services/auth/AuthService';

const authControllerHub = new AuthService<IUser>({
  model: Seller,
  role: 'seller',
});

export default authControllerHub;
