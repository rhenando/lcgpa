// app/api/admin/approve-and-authenticate-supplier/[id]/route.js
import { NextResponse } from "next/server";
import { db, auth } from "../../../../../firebase/admin";
import admin from "firebase-admin";

export async function PUT(request, { params }) {
  const oldDocId = params.id;

  if (!db || !auth) {
    console.error(
      "Firebase Admin has not been initialized. Check server logs for credential errors."
    );
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const oldRef = db.collection("users").doc(oldDocId);

  try {
    const snap = await oldRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }
    const oldData = snap.data();

    const phone = oldData.authPersonMobile || oldData.phone;
    const name = oldData.authPersonName || oldData.companyName;
    const email = oldData.authPersonEmail || oldData.companyEmail;

    if (!phone) {
      return NextResponse.json(
        { error: "Cannot authenticate: missing phone number" },
        { status: 400 }
      );
    }

    // --- UPDATED LOGIC TO PREVENT CRASH ---
    let userRecord;
    try {
      // Step 1: Try to find the user by phone number first.
      userRecord = await auth.getUserByPhoneNumber(phone);
    } catch (phoneError) {
      if (phoneError.code === "auth/user-not-found") {
        try {
          // Step 2: If not found by phone, try to find by email (if email exists).
          if (email) {
            userRecord = await auth.getUserByEmail(email);
          } else {
            // If no email, we must create a new user.
            throw new Error("User not found and no email provided to check.");
          }
        } catch (emailError) {
          if (emailError.code === "auth/user-not-found") {
            // Step 3: Only if not found by phone AND not found by email, create a new user.
            try {
              userRecord = await auth.createUser({
                phoneNumber: phone,
                displayName: name,
                email: email || undefined,
              });
            } catch (createError) {
              // This will catch the "email already in use" error if there's a race condition.
              console.error("Error creating Auth user:", createError);
              return NextResponse.json(
                { error: createError.message },
                { status: 500 }
              );
            }
          } else {
            // A different error occurred while looking up by email.
            console.error("Error fetching Auth user by email:", emailError);
            return NextResponse.json(
              { error: emailError.message },
              { status: 500 }
            );
          }
        }
      } else {
        // A different error occurred while looking up by phone.
        console.error("Error fetching Auth user by phone:", phoneError);
        return NextResponse.json(
          { error: phoneError.message },
          { status: 500 }
        );
      }
    }

    const authUid = userRecord.uid;
    const newRef = db.collection("users").doc(authUid);

    await newRef.set(
      {
        ...oldData,
        uid: authUid,
        approved: true,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (oldDocId !== authUid) {
      await oldRef.delete();
    }

    return NextResponse.json({
      message: "Supplier approved & authenticated",
      oldDocId,
      newUid: authUid,
    });
  } catch (error) {
    console.error("Error in approve/authenticate supplier:", error);
    return NextResponse.json(
      { error: "An internal server error occurred", details: error.message },
      { status: 500 }
    );
  }
}
