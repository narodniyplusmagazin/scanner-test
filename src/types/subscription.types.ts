export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSubscriptionPlanDto {
  id?: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  features?: string[];
}

export interface MySubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
}
