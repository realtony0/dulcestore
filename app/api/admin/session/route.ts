import { NextResponse } from "next/server";
import { checkPassword, ADMIN_COOKIE } from "@/lib/admin-auth";

/** Connexion admin : mot de passe correct → cookie de session. */
export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const token = checkPassword(password);

  const url = new URL("/admin", request.url);

  if (!token) {
    url.searchParams.set("erreur", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

