"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {LoadingButton} from "@/components/ui/loading-button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import {useState} from "react";
import {toast} from "sonner";
import {Rectangle} from "recharts";

export default function ClassSettingsGallery({cls}: {cls: {id: string, class_name: string}}) {
    const [files, setFiles] = useState<File[] | undefined>();
    const handleDrop = (files: File[]) => {
        console.log(files);
        setFiles(files);
    };

    // async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault(); // Prevent page refresh
    //     setIsLoading(true);
    //     const formData = new FormData(e.currentTarget);
    //     const name = String(formData.get("name") ?? "");
    //
    //     const result = await fetch("/api/changeclassname", { method: "POST", body: JSON.stringify({ class_name: name , class_id: cls.id}) });
    //     if (!result?.ok) {
    //         setIsLoading(false);
    //         toast.error("There was an error saving the settings.");
    //         return;
    //     } else {
    //         setIsLoading(false);
    //         toast.success("Settings Saved.");
    //         window.location.reload();
    //     }
    // }

    return(
        <Card className="mb-6">
            <form >
                <CardHeader className={"flex flex-row justify-between items-start "}>
                    <div>
                        <CardTitle>Class Logo</CardTitle>
                        <CardDescription>
                            Manage logo for <span className="font-medium">{cls.class_name}</span>.
                        </CardDescription>
                    </div>
                    <LoadingButton type={"submit"} >Save</LoadingButton>

                </CardHeader>
                <CardContent className={"flex flex-row"}>
                    <Dropzone
                        accept={{ 'image/*': [] }}
                        maxFiles={1}
                        maxSize={1024 * 1024 * 10}
                        minSize={1024}
                        onDrop={handleDrop}
                        onError={console.error}
                        src={files}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                    <div className="w-80 min-h-full flex flex-col justify-center items-center border border-gray-300 rounded-md ml-4 bg-white">
                        {files && files.length > 0 ? (
                            files.map((file, idx) => (
                                <img
                                    key={idx}
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="object-contain mb-2"
                                />
                            ))
                        ) : (
                            <span className="text-gray-400">No current/uploaded image </span>
                        )}
                    </div>





                </CardContent>


            </form>
        </Card>
    );
}