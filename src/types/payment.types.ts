// Payment entity type matching backend structure
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  yookassaPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'canceled';
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  confirmationUrl: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subscription?: {
    id: string;
    startDate: string;
    expiresAt: string;
  };
}
