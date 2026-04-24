import { AuthorizationError } from "@/lib/auth";

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-session-token")?.trim() ?? "";
}

export function requireBearerToken(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new AuthorizationError("Session token is required.");
  }
  return token;
}
