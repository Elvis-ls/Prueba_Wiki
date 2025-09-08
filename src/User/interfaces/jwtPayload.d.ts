export interface JwtPayload {
  id: number;
  role: string;
  userType: string;
  email: string;
  iat: number;
  exp: number;
}
