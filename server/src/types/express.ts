import { Request } from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export type AuthRequest = Request & {
  user: IUser;
};

export default AuthRequest; 