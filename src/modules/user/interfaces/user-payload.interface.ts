import { Role } from 'src/core/constants';

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
}
