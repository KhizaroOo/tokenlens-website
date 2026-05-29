import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "tl_session";

export interface SessionPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export function setSessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function validateCredentials(email: string, password: string) {
  const bcrypt = await import("bcryptjs");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

export async function getUserMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: "asc" },
  });
}
