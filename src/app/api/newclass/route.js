import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import pool from "../../../lib/db";
import * as crypto from "node:crypto";
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

export async function POST(req) {

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No auth header" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded;
  try {
    decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer:process.env.AUTH0_DOMAIN,
          algorithms: ["RS256"],
        },
        (err, decodedToken) => {
          if (err) reject(err);
          else resolve(decodedToken);
        }
      );
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }


  const email = decoded.email;
  const userId = decoded.sub;
  const name = decoded.name;


  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hash = crypto.createHash("sha256").update(email + userId).digest("hex");
  try {
    const classes = await pool.query(
      `INSERT INTO assignments (creator_userid, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [hash,name]
    );
    return NextResponse.json(classes.rows);
  } catch (err) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
