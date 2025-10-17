import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string; // optional (e.g. 'teacher' or 'student')
}

/**
 * Create a JWT token
 * @param payload - The data to encode
 * @param expiresIn - Expiration time (e.g. "1h", "7d")
 */
export function createToken(payload: TokenPayload, expiresIn: number = 60*60): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

/**
 * Verify a JWT token and return its payload
 */
export function verifyToken(token: string): JwtPayload | TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
