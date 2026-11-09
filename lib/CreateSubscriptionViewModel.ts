export interface CreateSubscriptionViewModel {
  userId: number;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;

  users: {
    id: number;
    name: string;
    email: string;
  }[];
}