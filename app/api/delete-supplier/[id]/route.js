// app/api/delete-supplier/[id]/route.js
import { NextResponse } from "next/server";
// 1. CORRECTED IMPORT PATH
// This now points to your admin.js file inside the /firebase folder.
import { db, auth } from "../../../../firebase/admin";

export async function DELETE(request, { params }) {
  try {
    const docId = params.id;

    if (!db || !auth) {
      console.error(
        "Firebase Admin has not been initialized. Check server logs for credential errors."
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const userRef = db.collection("users").doc(docId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const data = snap.data();
    // Use the UID from the document first, as it's the most reliable link to the Auth user.
    // Fallback to the document ID if the uid field is missing for some reason.
    let authUid = data.uid || docId;

    // 1. Delete Firebase Auth user
    try {
      await auth.deleteUser(authUid);
      console.log(`Auth user ${authUid} deleted`);
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        // If it's any error other than 'not found', we should stop and report it.
        throw err;
      }
      console.log(`Auth user ${authUid} not found, skipping deletion.`);
    }

    // 2. Delete the user document
    await userRef.delete();
    console.log(`Deleted users/${docId}`);

    // 3. Batch delete related data (like products)
    const productsSnap = await db
      .collection("products")
      .where("supplierId", "==", authUid)
      .get();
    if (!productsSnap.empty) {
      const batch = db.batch();
      productsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(
        `Deleted ${productsSnap.size} products for supplier ${authUid}`
      );
    }
    // ... add more deletion logic for other collections if needed

    return NextResponse.json({
      message: "Supplier and all related data deleted.",
    });
  } catch (error) {
    console.error("Error wiping out supplier data:", error);
    return NextResponse.json(
      {
        error: "Failed to delete supplier and related records",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
