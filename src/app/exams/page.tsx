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
    score?: number;
    out_of?: number;
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
    const pastExams = examRows.filter((exam: Exam) => new Date(exam.date_of_exam) <= now);

    const examsWithScores = pastExams.filter(exam => exam.score !== null && exam.out_of !== null);


    const chartData = examsWithScores
        .sort((a, b) => new Date(a.date_of_exam).getTime() - new Date(b.date_of_exam).getTime())
        .map((exam, index) => ({
            exam: index + 1,
            percentage: Math.round((exam.score! / exam.out_of!) * 100),
            subject: exam.subject_name,
            title: exam.title,
            date: new Date(exam.date_of_exam).toLocaleDateString()
        }));

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />
            <SidebarInset>
                <SiteHeader title={"Exams"} />
                <div className="justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Past Exams</h1>
                    <div className="flex gap-2">
                        <NewSubjectDialog />
                        <NewExamDialog subjects={subjectsRows} />
                    </div>
                </div>

                <div className="p-4 space-y-6">




                    {chartData.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Score Growth Over Time</h2>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="h-80">
                                        <div className="w-full h-full flex items-end justify-between space-x-2">
                                            {chartData.map((data, index) => (
                                                <div key={index} className="flex flex-col items-center flex-1">
                                                    <div className="text-xs text-muted-foreground mb-1">
                                                        {data.percentage}%
                                                    </div>
                                                    <div
                                                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                                        style={{ height: `${(data.percentage / 100) * 200}px` }}
                                                        title={`${data.title} - ${data.subject} (${data.date}): ${data.percentage}%`}
                                                    />
                                                    <div className="text-xs text-muted-foreground mt-1 text-center">
                                                        Exam {data.exam}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-muted-foreground">
                                        Hover over bars to see exam details
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}


                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Past Exams</h2>
                            <Badge variant="default">{pastExams.length}</Badge>
                        </div>

                        {pastExams.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No past exams recorded yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {pastExams.map((exam) => (
                                    <Card key={exam.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{exam.title}</h3>
                                                        <Badge variant="secondary">{exam.subject_name}</Badge>
                                                        {exam.score !== null && exam.out_of !== null && exam.score !== undefined && exam.out_of !== undefined && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                {exam.score}/{exam.out_of} ({Math.round((exam.score / exam.out_of) * 100)}%)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(exam.date_of_exam).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <MoreInfoButton exam={{id: exam.id.toString()}} type="exam" />
                                                    <DeleteExam examId={exam.id.toString()} examTitle={exam.title} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
