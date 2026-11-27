import type { Role } from '../types';

export type Action = 'post:view' | 'post:create' | 'post:resolve' | 'post:moderate';

const MATRIX: Record<Action, ReadonlyArray<Role | 'guest'>> = {
  'post:view': ['guest', 'member', 'admin'],
  'post:create': ['member'],
  'post:resolve': ['member'],
  'post:moderate': ['admin'],
};

export const can = (role: Role | undefined, action: Action): boolean =>
  MATRIX[action].includes(role ?? 'guest');
