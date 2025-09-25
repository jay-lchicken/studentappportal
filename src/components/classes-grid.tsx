import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import pool from "@/lib/db";
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {GoToClass} from "@/components/go-to-class";
import redis from "@/lib/redis";
import {minioClient} from "@/lib/upload";

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
    for (const row of rows) {
        if (row.logo_path) {
            try {
                let url = await redis.get(row.logo_path);
                if (url) {
                    row.logoURL = JSON.parse(url);
                    console.log("REDIS", row.logoURL)

                } else {
                    console.log("new redis ")

                    const expirySeconds = 60*60;
                    const presignedUrl = await minioClient.presignedGetObject('changemakers', row.logo_path, expirySeconds);
                    await redis.set(row.logo_path, JSON.stringify(presignedUrl), "EX", expirySeconds);
                    row.logoURL = presignedUrl;
                }
            }catch (error) {
                console.error("Error fetching logo URL:", error);
            }
        }
    }



    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
            {rows.map((row: any) => (
                <Card className="flex-1" key={row.class_id}>
                    <div  className="flex flex-row items-center justify-between">
                        {row.logoURL ? (
                            <img
                                src={`/api/proxy-image?url=${encodeURIComponent(row.logoURL)}`}
                                alt="Class logo"
                                className="w-12 h-12 m-2 object-contain"
                            />
                        ) : (
                            <img
                                src="/default-class-logo.png"
                                alt="Default class logo"
                                className="w-12 h-12 m-2 object-contain"
                            />
                        )}


                        <CardHeader className={"ml-[-90px]"}>
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