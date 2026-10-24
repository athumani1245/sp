export interface JWTPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  permissions: string[];
  subscription: {
    package_name: string;
    package_id: string;
    plan_name: string;
    plan_id: string;
    is_active: boolean;
    is_trial: boolean;
    max_units: number;
    start_date: string;
    end_date: string;
    days_left: number;
  };
}

/**
 * Decodes the payload of a JWT token (no signature verification — done server-side).
 * Returns null if the token is malformed.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonStr = atob(padded);
    return JSON.parse(jsonStr) as JWTPayload;
  } catch {
    return null;
  }
}
