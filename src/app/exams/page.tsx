import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { NewSubjectDialog } from "@/components/new-subject-dialog"
import MoreInfoButton from "@/components/MoreInfoButton";
import {NewExamDialog} from "@/components/new-exam-dialog";
import { DeleteExam } from "@/components/delete-exam";

import { auth0 } from "@/lib/auth0";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import crypto from "node:crypto";

interface Exam {
    id: number;
    title: string;
    date_of_exam: string;
    subject_name: string;
    paper_file_paths: number;
    subject_id: string;
}

interface Subject {
    id: number;
    subject_name: string;
    hash_userid: string;
}

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    const hash_userid_email = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');

    if (!session) {
        notFound()
    }

    const { rows: subjectsRows } = await pool.query(
        'SELECT * FROM subjects_exam WHERE hash_userid = $1 ORDER BY subject_name',
        [user?.sub]
    ) as { rows: Subject[] };

    const { rows: examRows } = await pool.query(
        `SELECT 
             er.*,
             se.subject_name
         FROM exam_records er
         JOIN subjects_exam se ON er.subject_id::int = se.id
         WHERE er.hash_userid_email = $1
         ORDER BY er.date_of_exam DESC`,
        [hash_userid_email]
    ) as { rows: Exam[] };

    const now = new Date();
    const upcomingExams = examRows.filter((exam: Exam) => new Date(exam.date_of_exam) >= now);
    const pastExams = examRows.filter((exam: Exam) => new Date(exam.date_of_exam) < now);

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />
            <SidebarInset>
                <SiteHeader title={"Exams"} />
                <div className="justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Exams</h1>
                    <div className="flex gap-2">
                        <NewSubjectDialog />
                        <NewExamDialog subjects={subjectsRows} />
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Upcoming Exams</h2>
                            <Badge variant="default">{upcomingExams.length}</Badge>
                        </div>

                        {upcomingExams.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No upcoming exams scheduled.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {upcomingExams.map((exam: Exam) => (
                                    <Card key={exam.id} className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{exam.title}</h3>
                                                        <Badge variant="outline">
                                                            {exam.subject_name}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Date: {new Date(exam.date_of_exam).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {exam.paper_file_paths > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {exam.paper_file_paths} file(s) uploaded
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={"flex flex-col gap-2 items-end"}>
                                                    <MoreInfoButton exam={{ id: String(exam.id) }} type="exam" />
                                                    <DeleteExam examId={String(exam.id)} examTitle={exam.title} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Past Exams</h2>
                            <Badge variant="secondary">{pastExams.length}</Badge>
                        </div>

                        {pastExams.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No past exams recorded yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {pastExams.map((exam: Exam) => (
                                    <Card key={exam.id} className="border-l-4 border-l-gray-300 opacity-75">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{exam.title}</h3>
                                                        <Badge variant="outline">
                                                            {exam.subject_name}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Date: {new Date(exam.date_of_exam).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {exam.paper_file_paths > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {exam.paper_file_paths} file(s) uploaded
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={"flex flex-col gap-2 items-end"}>
                                                    <MoreInfoButton exam={{ id: String(exam.id) }} type="exam" />
                                                    <DeleteExam examId={String(exam.id)} examTitle={exam.title} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {subjectsRows.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center">
                                <p className="text-muted-foreground mb-4">
                                    You haven't created any subjects yet. Create a subject first to start adding exam records.
                                </p>
                                <NewSubjectDialog />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
