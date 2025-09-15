import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../lib/db";
import * as crypto from "node:crypto";
export async function POST(req) {
  const session = await auth0.getSession();

  async function getManagementToken() {
    const res = await fetch(`${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `${process.env.AUTH0_DOMAIN}/api/v2/`
      })
    });
    const data = await res.json();
    return data.access_token;
  }




  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { new_member_email, class_id } = await req.json();

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
    const managementToken = await getManagementToken();

    const userSearchRes = await fetch(
        `${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${new_member_email}`,
        {
          headers: {
            "Authorization": `Bearer ${managementToken}`,
            "Content-Type": "application/json"
          }
        }
    );
    if (!userSearchRes.ok) {
      return NextResponse.json({ error: "Failed to search Auth0" }, { status: 500 });
    }
    const foundUsers = await userSearchRes.json();
    if (foundUsers.length === 0) {
      return NextResponse.json({ error: "User does not exist in Auth0 directory" }, { status: 400 });
    }
    const verifyOwnership = await pool.query(
        `SELECT * FROM class_user
         WHERE class_id = $1 AND hash_userid = $2 AND isadmin;`,
        [class_id, hash]
    );
    if (verifyOwnership.rows.length === 0) {
      return NextResponse.json(
          { error: "You are not the owner of this class" },
          { status: 401 }
      );
    }
    console.log(foundUsers[0]);
    const new_hash = crypto
        .createHash("sha256")
        .update(foundUsers[0].email+ foundUsers[0].user_id )
        .digest("hex");

    const new_user = await pool.query(`
      INSERT INTO class_user (hash_userid, class_id, email, name)
      VALUES ($1, $2, $3, $4)
        RETURNING *`, [new_hash,class_id, foundUsers[0].email, foundUsers[0].given_name]);



    return NextResponse.json(new_user.rows);
  } catch (err) {
    console.error("DB Insert Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}