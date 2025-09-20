import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import pool from '@/lib/db';
import crypto from 'node:crypto';

export async function DELETE(request) {
    try {
        const session = await auth0.getSession();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('id');

        if (!examId) {
            return NextResponse.json(
                { error: 'Exam ID is required' },
                { status: 400 }
            );
        }

        const user = session.user;
        const hash_userid_email = crypto.createHash('sha256')
            .update(`${user.email ?? ''}${user.sub ?? ''}`)
            .digest('hex');

        const { rows: examRows } = await pool.query(
            'SELECT id FROM exam_records WHERE id = $1 AND hash_userid_email = $2',
            [examId, hash_userid_email]
        );

        if (examRows.length === 0) {
            return NextResponse.json(
                { error: 'Exam not found or unauthorized' },
                { status: 404 }
            );
        }

        await pool.query(
            'DELETE FROM exam_records WHERE id = $1 AND hash_userid_email = $2',
            [examId, hash_userid_email]
        );

        return NextResponse.json(
            { message: 'Exam deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting exam:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
