"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon, ClockIcon, UserIcon } from "lucide-react";
import { HomeworkToggle } from "@/components/homework-toggle";
import { DeleteHomeworkButton } from "@/components/delete-homework";
import Link from "next/link";
import { DateTime } from "luxon";
import { useMemo } from "react";

export default function ClientDateCard({ homework, fileArrayPath }: any) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dueDate = homework.due_date
        ? DateTime.fromISO(homework.due_date, { zone: tz })
        : null;

    const createdDate = homework.date_created
        ? DateTime.fromISO(homework.date_created, { zone: tz })
        : null;

    const now = DateTime.now().setZone(tz);

    const isValidDueDate = dueDate?.isValid;
    const isOverdue = isValidDueDate && !homework.completed && dueDate < now;

    const daysUntilDue = isValidDueDate ? Math.ceil(dueDate.diff(now, "days").days) : 0;
    const hoursUntilDue = isValidDueDate ? dueDate.diff(now, "hours").hours : 0;
    const timeDiff = isValidDueDate ? dueDate.diff(now).negate().shiftTo("days", "hours", "minutes") : null;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <CardTitle className="text-2xl">{homework.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    {homework.completed ? (
                                        <Badge variant="default" className="bg-green-500">
                                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                                            Completed
                                        </Badge>
                                    ) : isOverdue ? (
                                        <Badge variant="destructive">
                                            <XCircleIcon className="w-3 h-3 mr-1" />
                                            Overdue
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            <ClockIcon className="w-3 h-3 mr-1" />
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {homework.class_name && (
                                    <div className="flex items-center gap-1">
                                        <BookOpenIcon className="w-4 h-4" />
                                        <Badge variant="outline">{homework.class_name}</Badge>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    <span>Created by {homework.creator_name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <HomeworkToggle homeworkId={homework.id} completed={homework.completed} />
                            <DeleteHomeworkButton homeworkId={homework.id} />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CalendarIcon className="w-5 h-5" />
                            Due Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold">
                                {dueDate?.toLocaleString(DateTime.DATETIME_FULL) ?? "Invalid date"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {dueDate?.toLocaleString(DateTime.TIME_SIMPLE) ?? "Invalid time"}
                            </p>

                            {!homework.completed && isValidDueDate && (
                                <div className="mt-3">
                                    {isOverdue ? (
                                        <p className="text-red-600 font-medium">
                                            Overdue by {timeDiff?.toHuman({ unitDisplay: "short", maximumFractionDigits: 0 })}
                                        </p>
                                    ) : hoursUntilDue < 1 ? (
                                        <p className="text-orange-600 font-medium">
                                            Due in {Math.ceil(hoursUntilDue * 60)} minutes!
                                        </p>
                                    ) : hoursUntilDue < 24 ? (
                                        <p className="text-orange-600 font-medium">
                                            Due in {Math.ceil(hoursUntilDue)} hour{Math.ceil(hoursUntilDue) !== 1 ? "s" : ""}
                                        </p>
                                    ) : daysUntilDue === 1 ? (
                                        <p className="text-orange-600 font-medium">Due tomorrow</p>
                                    ) : (
                                        <p className="text-blue-600 font-medium">
                                            {daysUntilDue} days remaining
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircleIcon className="w-5 h-5" />
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Completion Status:</span>
                                {homework.completed ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Completed
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        Not Completed
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="text-sm text-muted-foreground">
                                <p><span className="font-medium">Created:</span> {createdDate?.toLocaleString(DateTime.DATE_MED) ?? "Invalid date"}</p>
                                <p><span className="font-medium">Creator:</span> {homework.creator_name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}