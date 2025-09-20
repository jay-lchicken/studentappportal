import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import redis from "@/lib/redis";
import * as crypto from "node:crypto";

export async function POST(req) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, subject_id, date_of_exam, filePaths } = await req.json();

  const email = session.user.email;
  const userId = session.user.sub;

  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash_userid_email = crypto
    .createHash("sha256")
    .update(email + userId)
    .digest("hex");

  try {
    if (!title || !subject_id || !date_of_exam) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subjectCheck = await pool.query(
      'SELECT * FROM subjects_exam WHERE id = $1 AND hash_userid = $2',
      [subject_id, userId]
    );

    if (subjectCheck.rows.length === 0) {
      return NextResponse.json({ error: "Subject not found or unauthorized" }, { status: 403 });
    }

    const new_exam = await pool.query(
      `INSERT INTO exam_records (subject_id, hash_userid_email, paper_file_paths, date_of_exam, title)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [subject_id, hash_userid_email, filePaths, date_of_exam, title]
    );



    return NextResponse.json({
      success: true,
      exam: new_exam.rows[0],
      message: "Exam created successfully"
    });

  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
