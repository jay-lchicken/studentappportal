import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import pool from "@/lib/db";

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
    <div className="grid md:grid-cols-4 grid-cols-1 gap-3 p-4">
      {rows.map((row: any) => (
        <Card className="flex-1" key={row.class_id}>
          <CardHeader>
            <CardTitle>{row.class_name}</CardTitle>
            <CardDescription>Creator: {row.name || "No name"}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}