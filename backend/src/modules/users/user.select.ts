import { Prisma } from '@prisma/client';

/**
 * Fields safe to send to a client. Declared explicitly so that adding a
 * sensitive column to the User model (passwordHash was the first) can never
 * silently start leaking through the profile endpoints.
 */
export const USER_PUBLIC_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  title: true,
  isGuest: true,
  avatarUrl: true,
  colorMode: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
