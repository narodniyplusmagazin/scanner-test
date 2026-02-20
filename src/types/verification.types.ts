export interface VerificationRecord {
  id?: string | number;
  userId?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
