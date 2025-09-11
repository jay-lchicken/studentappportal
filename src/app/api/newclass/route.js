import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../lib/db";
import * as crypto from "node:crypto";
import {minioClient} from "../../../lib/upload";
export async function POST(req) {
  const session = await auth0.getSession();
  const contents = 'hello';
  // console.log("Testing Minio upload");
  //
  // await minioClient.putObject(
  //     'changemakers',
  //     'hello.txt',
  //     contents,
  //     {'Content-Type': 'text/plain'}
  // );
  //   console.log("Minio upload complete");



  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { class_name } = await req.json();

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
    const classes = await pool.query(
      `INSERT INTO classes (creator_userid, name, class_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [hash, name, class_name]
    );
    const userClass = await pool.query(
      `INSERT INTO class_user (hash_userid, class_id, email, isadmin, name)
       VALUES ($1, $2, $3, true, $4)
       RETURNING *`,
      [hash, classes.rows[0].id, email, name]
    );

    return NextResponse.json(classes.rows);
  } catch (err) {
    console.error("DB Insert Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}