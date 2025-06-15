import { IUser } from '@/types/models';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
} 