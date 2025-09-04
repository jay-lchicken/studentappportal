import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from "next/server";
import pool from "../../../lib/db";
import * as crypto from "node:crypto";

export async function POST(req) {
    const session = await auth0.getSession();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { class_name, class_id } = await req.json();

    const email = session.user.email;
    const userId = session.user.sub;

    if (!userId || !email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
        .createHash("sha256")
        .update(email + userId)
        .digest("hex");
    console.log(hash);

    try {
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
        const classes = await pool.query(
            `UPDATE classes SET class_name = $1 WHERE id = $2 RETURNING *`,
            [class_name, class_id]
        );

        return NextResponse.json(classes.rows);
    } catch (err) {
        console.error("DB Insert Error:", err);
        return new NextResponse("Internal server error", { status: 500 });
    }
}