import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import pool from "@/lib/db";
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";

export default async function ClassesGrid() {
    const { rows } = await pool.query(
        `SELECT * FROM class_user
                           JOIN classes ON class_user.class_id = classes.id
         WHERE class_user.hash_userid = $1`,
        ['493bffad6157234c17ca2abfb123b66676b046d145d12ca3ae77085a4a608251']
    );
    if (rows.length === 0) {
        return <div className="p-4">No classes found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {rows.map((row: any) => (
                <Card className="flex-1" key={row.class_id}>
                    <div  className="flex flex-row items-center justify-between">
                        <CardHeader>
                            <CardTitle>{row.class_name}</CardTitle>
                            <CardDescription>Creator: {row.name || "No name"}</CardDescription>

                        </CardHeader>
                        <Button size={"icon"} variant={"outline"} className={"mr-4"}><ArrowRight/></Button>
                    </div>


                </Card>
            ))}
        </div>
    );
}