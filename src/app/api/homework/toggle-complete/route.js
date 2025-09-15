import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../../lib/db";
import * as crypto from "node:crypto";

export async function PATCH(req) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const { homeworkId, completed } = await req.json();

  const email = session.user.email;
  const userId = session.user.sub;

  if (!userId || !email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hash = crypto
      .createHash("sha256")
    .update(email + userId)
    .digest("hex");


  try {
    if (!homeworkId || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const verifyOwnership = await pool.query(
      `SELECT * FROM homework WHERE id = $1 AND personal_hashid = $2`,
      [homeworkId, hash]
    );



    if (verifyOwnership.rows.length === 0) {
      return NextResponse.json({ error: "Homework not found or access denied" }, { status: 404 });
    }

    const updateResult = await pool.query(
      `UPDATE homework SET completed = $1 WHERE id = $2 AND personal_hashid = $3 RETURNING *`,
      [completed, homeworkId, hash]
    );


    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: "Failed to update homework" }, { status: 500 });
    }




    return NextResponse.json({
      success: true,
      homework: updateResult.rows[0]
    });

  } catch (err) {
    console.error("DB Update Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
