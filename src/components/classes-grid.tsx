import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import pool from "@/lib/db";
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GoToClass} from "@/components/go-to-class";

export default async function ClassesGrid({hash}: { hash: string }) {
    const { rows } = await pool.query(
        `SELECT * FROM class_user
                           JOIN classes ON class_user.class_id = classes.id
         WHERE class_user.hash_userid = $1`,
        [hash]
    );
    if (rows.length === 0) {
        return <div className="p-4 ml-1">No classes found.</div>;
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
                        <GoToClass url={`classes/${row.id}`}/>
                    </div>


                </Card>
            ))}
        </div>
    );
}