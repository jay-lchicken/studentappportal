import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import crypto from "node:crypto";

export async function POST(req) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject_name } = await req.json();
    const email = session.user.email;
    const userId = session.user.sub;


    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
        .createHash("sha256")
        .update(email + userId)
        .digest("hex");

    if (!subject_name || !subject_name.trim()) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    const result = await pool.query(
        'INSERT INTO subjects_exam (subject_name, hash_userid) VALUES ($1, $2) RETURNING *',
        [subject_name.trim(), hash]
    );

    return NextResponse.json({
      success: true,
      subject: result.rows[0],
      message: "Subject created successfully"
    });

  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
        { error: "Failed to create subject" },
        { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = session.user.email;
    const userId = session.user.sub;


    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
        .createHash("sha256")
        .update(email + userId)
        .digest("hex");


    const result = await pool.query(
        'SELECT * FROM subjects_exam WHERE hash_userid = $1 ORDER BY subject_name',
        [hash]
    );

    return NextResponse.json({
      success: true,
      subjects: result.rows
    });

  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
        { error: "Failed to fetch subjects" },
        { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('id');

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
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


    const examCheck = await pool.query(
        'SELECT COUNT(*) as count FROM exam_records WHERE subject_id = $1 AND hash_userid = $2',
        [subjectId, hash]
    );

    if (parseInt(examCheck.rows[0].count) > 0) {
      return NextResponse.json(
          { error: "Cannot delete subject with associated exams" },
          { status: 400 }
      );
    }
    const result = await pool.query(
        'DELETE FROM subjects_exam WHERE id = $1 AND hash_userid = $2 RETURNING *',
        [subjectId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
        { error: "Failed to delete subject" },
        { status: 500 }
    );
  }
}
