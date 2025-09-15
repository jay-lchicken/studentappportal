import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../../lib/db";
import * as crypto from "node:crypto";
export async function POST(req) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, class_id, date } = await req.json();

  const email = session.user.email;
  const userId = session.user.sub;
  const name = session.user.name || "Unknown";


  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hash = crypto
      .createHash("sha256")
      .update(email + userId)
      .digest("hex");
  console.log(hash);


  try {
    if (!title || !class_id || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (class_id == "no_class"){
      const new_homework = await pool.query(
          `INSERT INTO homework (title, due_date, creator_hashid, creator_name, personal_hashid)
           VALUES ($1, $2, $3, $4, $5)
             RETURNING *;`,
          [title, date,  hash, name, hash]
      );
      return NextResponse.json(new_homework.rows);

    }else{
      const verifyInClass = await pool.query(
          `SELECT * FROM class_user
           WHERE class_id = $1 AND hash_userid = $2`,
          [class_id, hash]
      );
      const all_members = await pool.query(
          `SELECT * FROM class_user
           WHERE class_id = $1`,
          [class_id]
      );
      for (const member of all_members.rows) {
        const new_homework = await pool.query(
            `INSERT INTO homework (title, due_date, creator_hashid, creator_name, class_id_link, personal_hashid)
             VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING *;`,
            [title, date, hash, name, class_id, member.hash_userid] );
      }
      return NextResponse.json({ verifyInClass });
    }






  } catch (err) {
    console.error("DB Insert Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}