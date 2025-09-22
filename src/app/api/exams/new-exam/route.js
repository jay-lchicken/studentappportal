import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";
import crypto from "node:crypto";

export async function POST(req) {
    try {
        const session = await auth0.getSession();
        if (!session) {
            return new Response("Unauthorized", {status: 401});
        }

        const user = session.user;
        const hash_userid_email = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');

        const body = await req.json();
        const {title, subject_id, date_of_exam, score, out_of, uploaded_files} = body;

        if (!title || !subject_id || !date_of_exam) {
            return new Response("Missing required fields", {status: 400});
        }

        if ((score !== null && out_of === null) || (score === null && out_of !== null)) {
            return new Response("Both score and out_of must be provided together or both null", {status: 400});
        }

        if (score !== null && out_of !== null) {
            if (score < 0 || out_of < 1 || score > out_of) {
                return new Response("Invalid score values", {status: 400});
            }
        }

        const {rows: subjectRows} = await pool.query(
            'SELECT id FROM subjects_exam WHERE id = $1 AND hash_userid = $2',
            [subject_id, hash_userid_email]
        );

        if (subjectRows.length === 0) {
            return new Response("Subject not found or access denied", {status: 404});
        }

        const {rows: examRows} = await pool.query(
            `INSERT INTO exam_records (title,
                                       date_of_exam,
                                       subject_id,
                                       hash_userid_email,
                                       paper_file_paths,
                                       score,
                                       out_of)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                title,
                date_of_exam,
                subject_id,
                hash_userid_email,
                uploaded_files,
                score,
                out_of
            ]
        );


        return new Response(
            JSON.stringify({
                success: true,
                message: "Exam created successfully"
            }),
            {
                status: 201,
                headers: {"Content-Type": "application/json"}
            }
        );

    } catch (error) {
        console.error("Error creating exam:", error);
        return new Response(
            JSON.stringify({error: "Failed to create exam"}),
            {
                status: 500,
                headers: {"Content-Type": "application/json"}
            }
        );
    }
}
