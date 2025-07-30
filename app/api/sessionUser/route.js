// app/api/sessionUser/route.js
import { NextResponse } from "next/server";
// 1. CORRECTED IMPORT PATH
// This now points to your admin.js file inside the /firebase folder.
import { db, auth } from "../../../firebase/admin";

export async function GET(req) {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) {
    return NextResponse.json({ user: null });
  }

  try {
    // Verify session cookie
    const decoded = await auth.verifySessionCookie(cookie, true);

    // Fetch Firestore user doc
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const data = userDoc.exists ? userDoc.data() : {};

    // Keep your original logic for finding the best display name
    const displayName =
      data.displayName ??
      data.name ??
      data.companyName ??
      data.companyNameEn ??
      data.companyNameAr ??
      decoded.name ??
      "";

    // Return full user object
    return NextResponse.json({
      user: {
        uid: decoded.uid,
        email: decoded.email,
        displayName,
        role: data.role ?? "",
      },
    });
  } catch (err) {
    console.error("sessionUser error:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
