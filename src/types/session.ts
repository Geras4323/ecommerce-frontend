export type JWTUser = {
  id: number;
  name: string;
  role: string;
  securityUUID: string;
};

export type Session = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "admin" | "customer";
  orders: null;
};
