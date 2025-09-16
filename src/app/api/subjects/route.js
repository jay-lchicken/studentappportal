import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function POST(req) {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject_name } = await req.json();
    const userId = session.user.sub;

    if (!subject_name || !subject_name.trim()) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    // Insert the new subject into the database
    const result = await pool.query(
      'INSERT INTO subjects_exam (subject_name, hash_userid) VALUES ($1, $2) RETURNING *',
      [subject_name.trim(), userId]
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
    const userId = session.user.sub;

    const result = await pool.query(
      'SELECT * FROM subjects_exam WHERE hash_userid = $1 ORDER BY subject_name',
      [userId]
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
