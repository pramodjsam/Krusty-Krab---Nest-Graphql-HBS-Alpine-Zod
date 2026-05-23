import { UserPayload } from './modules/user/interfaces/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}
