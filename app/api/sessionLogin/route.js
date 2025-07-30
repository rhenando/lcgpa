// app/api/sessionLogin/route.js
import { NextResponse } from "next/server";
// 1. CORRECTED IMPORT: Use the named 'auth' export and the correct relative path
import { auth } from "../../../firebase/admin";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    // 24 hours in milliseconds
    const expiresIn = 24 * 60 * 60 * 1000;

    // 2. USE THE IMPORTED 'auth' OBJECT DIRECTLY
    // Create the session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000, // maxAge is in seconds
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Session Login Error:", error);
    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 401 }
    );
  }
}
