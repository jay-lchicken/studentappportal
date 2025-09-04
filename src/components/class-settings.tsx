"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {LoadingButton} from "@/components/ui/loading-button";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {toast} from "sonner";

export default function ClassSettings({cls}: {cls: {id: string, class_name: string}}) {
    const [className, setClassName] = useState(cls.class_name);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // Prevent page refresh
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const name = String(formData.get("name") ?? "");

        const result = await fetch("/api/changeclassname", { method: "POST", body: JSON.stringify({ class_name: name , class_id: cls.id}) });
        if (!result?.ok) {
            setIsLoading(false);
            toast.error("There was an error saving the settings.");
            return;
        } else {
            setIsLoading(false);
            toast.success("Settings Saved.");
            window.location.reload();
        }
    }

    return(
        <Card className="mb-6">
            <form onSubmit={saveSettings}>
                <CardHeader className={"flex flex-row justify-between items-start "}>
                    <div>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>
                            Manage details for <span className="font-medium">{cls.class_name}</span>.
                        </CardDescription>
                    </div>
                    <LoadingButton type={"submit"} loading={isLoading}>Save</LoadingButton>

                </CardHeader>
                <CardContent>
                    <Input type="text" name={"name"} placeholder="Class Name" value={className} onChange={(event) => setClassName(event.target.value)} />
                </CardContent>
            </form>
        </Card>
    );
}