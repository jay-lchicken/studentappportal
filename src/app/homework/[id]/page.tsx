import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpenIcon } from "lucide-react"
import { auth0 } from "@/lib/auth0"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import pool from "@/lib/db"
import crypto from "node:crypto"
import Link from "next/link"
import redis from "@/lib/redis";
import { minioClient } from "@/lib/upload";
import ClientDateCard from "@/components/client-date-card";
interface Homework {
    id: number;
    title: string;
    description?: string;
    due_date: Date;
    completed: boolean;
    creator_name: string;
    class_name?: string;
    class_id_link: string;
    date_created: Date;
    file_paths?: string[];
    links?: string[];
}

interface Files {
    name: string;
    url: string;
}

export default async function HomeworkDetailPage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>
}) {
    const session = await auth0.getSession();
    const user = session?.user;
    const fileArrayPath: Files[] = [];
    const hash_email_userid = crypto.createHash("sha256")
        .update(`${user?.email ?? ""}${user?.sub ?? ""}`)
        .digest("hex");

    if (!session) {
        notFound();
    }

    const homeworkID = (await params).id?.trim();

    const { rows: homeworkRows } = await pool.query(
        `SELECT
             h.*,
             c.class_name as class_name
         FROM homework h
                  LEFT JOIN classes c ON h.class_id_link::uuid = c.id
         WHERE h.id = $1 AND h.personal_hashid = $2`,
        [homeworkID, hash_email_userid]
    ) as { rows: Homework[] };

    if (homeworkRows.length === 0) {
        notFound();
    }

    const homework = homeworkRows[0];


    if (homework.file_paths) {
        for (const filePath of homework.file_paths) {
            let url = await redis.get(filePath);
            if (url) {
                fileArrayPath.push(JSON.parse(url));
            } else {
                try {
                    const objectStat = await minioClient.statObject("changemakers", filePath);
                    const originalFileName =
                        objectStat.metaData?.["original-name"] ||
                        objectStat.metaData?.originalName ||
                        "download";

                    const expirySeconds = 60 * 60 * 24;
                    const presignedUrl = await minioClient.presignedGetObject(
                        "changemakers",
                        filePath,
                        expirySeconds,
                        {
                            "response-content-disposition": `attachment; filename="${decodeURIComponent(originalFileName)}"`
                        }
                    );

                    await redis.set(filePath, JSON.stringify({ name: originalFileName, url: presignedUrl }), "EX", expirySeconds);
                    fileArrayPath.push({ name: originalFileName, url: presignedUrl });
                } catch (error) {
                    console.error("Error fetching file from MinIO:", error);
                }
            }
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />

            <SidebarInset>
                <SiteHeader title="Homework Details" />

                <div className="p-4">
                    <div className="mb-6">
                        <Link href="/homework">
                            <Button variant="outline" size="sm">
                                ← Back to Homework
                            </Button>
                        </Link>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <ClientDateCard
                            homework={{
                                ...homework,
                                due_date: homework.due_date?.toISOString(),
                                date_created: homework.date_created?.toISOString(),
                            }}
                            fileArrayPath={fileArrayPath}
                        />
                        {fileArrayPath.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Attachments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {fileArrayPath.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {file.name.length > 40 ? file.name.slice(0, 37) + '...' : file.name}
                                                </a>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="outline" size="sm">
                                                        Download
                                                    </Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {Array.isArray(homework.links) && homework.links?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {homework.links?.map((link, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {link.length > 40 ? link.slice(0, 37) + '...' : link}
                                                </a>
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="outline" size="sm">
                                                        Visit
                                                    </Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {homework.class_name && homework.class_id_link && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookOpenIcon className="w-5 h-5" />
                                        Class Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{homework.class_name}</p>

                                        </div>
                                        <Link href={`/classes/${homework.class_id_link}`}>
                                            <Button variant="outline" size="sm">
                                                View Class
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}