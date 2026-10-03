import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { getDb } from "../../../lib/db";
import { createSession, getSession } from "../../../lib/auth";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) redirect("/settings?verified=0");

  const db = getDb();
  const session = await getSession();
  if (!db || !session) redirect("/auth?verified=0");

  try {
    const result = await db.query(
      "select id,email,pending_email,email_verification_token_hash,email_verification_expires_at from users where id=$1",
      [session.userId]
    );
    if (!result.rowCount) redirect("/auth?verified=0");

    const user = result.rows[0];
    const valid = Boolean(
      user.pending_email &&
      user.email_verification_token_hash === hashToken(token) &&
      user.email_verification_expires_at &&
      new Date(user.email_verification_expires_at).getTime() > Date.now()
    );
    if (!valid) redirect("/settings?verified=0");

    const updated = await db.query(
      `update users
       set email=pending_email,
           pending_email=null,
           email_verification_token_hash=null,
           email_verification_expires_at=null,
           updated_at=now()
       where id=$1
       returning id,email,name,phone,preferences,created_at`,
      [user.id]
    );

    const nextUser = updated.rows[0];
    await createSession(nextUser.id, nextUser.email);
    redirect("/settings?verified=1");
  } catch {
    redirect("/settings?verified=0");
  }
}
