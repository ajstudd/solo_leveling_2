import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function signJwt(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): AuthJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
  } catch {
    return null;
  }
}
