import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../lib/db";
import * as crypto from "node:crypto";
import { minioClient } from "../../../lib/upload";

export async function POST(req) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const class_id = formData.get('class_id');

    if (!file || !class_id) {
      return NextResponse.json({ error: "Missing file or class_id" }, { status: 400 });
    }

    const email = session.user.email;
    const userId = session.user.sub;

    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
      .createHash("sha256")
      .update(email + userId)
      .digest("hex");

    const verifyOwnership = await pool.query(
      `SELECT * FROM class_user
       WHERE class_id = $1 AND hash_userid = $2 AND isadmin = true`,
      [class_id, hash]
    );

    if (verifyOwnership.rows.length === 0) {
      return NextResponse.json(
        { error: "You are not the owner of this class" },
        { status: 401 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop();
    const fileName = `class-logos/${class_id}-${Date.now()}.${fileExtension}`;
    await minioClient.putObject(
      'changemakers',
      fileName,
      buffer,
      buffer.length,
      {
        'Content-Type': file.type,
        'Content-Length': buffer.length
      }
    );

    console.log("MinIO upload complete:", fileName);

    await pool.query(
      `UPDATE classes SET logo_path = $1 WHERE id = $2`,
      [fileName, class_id]
    );

    return NextResponse.json({
      success: true,
      fileName: fileName,
      message: "Logo uploaded successfully"
    });

  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}