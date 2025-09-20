import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileTextIcon, DownloadIcon } from "lucide-react"
import { auth0 } from "@/lib/auth0"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import pool from "@/lib/db"
import crypto from "node:crypto"
import Link from "next/link"
import redis from "@/lib/redis";
import { minioClient } from "@/lib/upload";

interface Exam {
    id: number;
    title: string;
    date_of_exam: Date;
    subject_name: string;
    subject_id: string;
    paper_file_paths: FilePath[];
    hash_userid_email: string;
}

interface Files {
    name: string;
    url: string;
}

interface FilePath {
    file_path: string;
    original_name: string;
}

export default async function ExamDetailPage({
                                                 params,
                                             }: {
    params: Promise<{ id: string }>
}) {
    const session = await auth0.getSession();
    const user = session?.user;
    const fileArrayPath: Files[] = [];
    const resolvedParams = await params;
    const hash_userid_email = crypto.createHash("sha256")
        .update(`${user?.email ?? ""}${user?.sub ?? ""}`)
        .digest("hex");

    if (!session) {
        notFound();
    }

    const { rows: examRows } = await pool.query(
        `SELECT
             er.*,
             se.subject_name
         FROM exam_records er
                  JOIN subjects_exam se ON er.subject_id::int = se.id
         WHERE er.id = $1 AND er.hash_userid_email = $2`,
        [resolvedParams.id, hash_userid_email]
    );

    if (examRows.length === 0) {
        notFound();
    }

    const exam: Exam = examRows[0];


    for (const filePath of exam.paper_file_paths) {
        let url = await redis.get(filePath.file_path);
        if (url) {
            fileArrayPath.push({
                name: filePath.original_name,
                url: JSON.parse(url)
            });
        } else {
            try {
                const expirySeconds = 24 * 60 * 60;
                const presignedUrl = await minioClient.presignedGetObject('changemakers', filePath.file_path, expirySeconds);
                await redis.set(filePath.file_path, JSON.stringify(presignedUrl), "EX", expirySeconds);
                fileArrayPath.push({
                    name: filePath.original_name,
                    url: presignedUrl
                });
            } catch (error) {
                console.error(`Error generating presigned URL for ${filePath.file_path}:`, error);
            }
        }



    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />
            <SidebarInset>
                <SiteHeader title="Exam Details" />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold">{exam.title}</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{exam.subject_name}</Badge>
                                <Badge variant={new Date(exam.date_of_exam) >= new Date() ? "default" : "secondary"}>
                                    {new Date(exam.date_of_exam) >= new Date() ? "Upcoming" : "Past"}
                                </Badge>
                            </div>
                        </div>
                        <Link href="/exams">
                            <Button variant="outline">Back to Exams</Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Exam Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium">Subject</h4>
                                    <p className="text-muted-foreground">{exam.subject_name}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Exam Date & Time</h4>
                                    <p className="text-muted-foreground">
                                        {new Date(exam.date_of_exam).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Files Uploaded</h4>
                                    <p className="text-muted-foreground">
                                        {exam.paper_file_paths.length > 0 ? `${exam.paper_file_paths.length} file(s)` : "No files uploaded"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DownloadIcon className="h-5 w-5" />
                                    Uploaded Papers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {fileArrayPath.length > 0 ? (
                                    <div className="space-y-3">
                                        {fileArrayPath.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3  flex-shrink min-w-0">
                                                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium truncate ">{file.name}</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                    >
                                                        <DownloadIcon className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No papers uploaded for this exam</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
