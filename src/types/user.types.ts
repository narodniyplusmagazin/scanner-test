export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export interface User {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions?: number;
    payments?: number;
    usages?: number;
  };
}

export interface CreateUserDto {
  fullName: string;
  phone?: string;
  email?: string;
  gender: Gender;
  password: string;
  acceptTerms: boolean;
}
