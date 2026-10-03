import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.AUTH_SECRET;
if (!secret) {
  // Development can still build; production must set AUTH_SECRET.
}

function getKey() {
  return new TextEncoder().encode(secret || "careerpilot-development-secret-change-me");
}

export async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());

  const jar = await cookies();
  jar.set("careerpilot-session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const token = (await cookies()).get("careerpilot-session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete("careerpilot-session");
}
