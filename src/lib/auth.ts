import { verifyToken, type JwtPayload } from "./jwt";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

export function getUserFromToken(): JwtPayload | null {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function isAuthenticated(): boolean {
  const user = getUserFromToken();
  return user !== null;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
