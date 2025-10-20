export type ID = string;

export type Org = { id: ID; name: string; currency: string; timeZone: string };
export type Location = { id: ID; orgId: ID; name: string; tz?: string };
export type Role =
  | "owner"
  | "admin"
  | "manager"
  | "clerk"
  | "tech"
  | "viewer";
export type User = { id: ID; name: string; email: string; roles: Role[]; orgId: ID };

export type Money = { amount: number; currency: string };
export type PriceList = { id: ID; name: string; currency: string; rules: PriceRule[] };
export type PriceRule = { id: ID; selector: Record<string, unknown>; formula: string };
