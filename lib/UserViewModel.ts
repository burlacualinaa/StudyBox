export interface UserViewModel {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
}