"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {LoadingButton} from "@/components/ui/loading-button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import {useEffect, useState} from "react";
import {toast} from "sonner";

export default function ClassSettingsGallery({cls, logo_path}: {cls: {id: string, class_name: string},logo_path: string}) {
    const [files, setFiles] = useState<File[] | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);


    useEffect(() => {
        console.log('Logo path:', logo_path);
    }, [logo_path]);

    const handleDrop = (files: File[]) => {
        console.log(files);
        setFiles(files);
    };

    const handleImageError = () => {
        console.error('Failed to load image:', logo_path);
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log('Image loaded successfully:', logo_path);
        setImageError(false);
    };

    async function uploadLogo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!files || files.length === 0) {
            toast.error("Please select an image first");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('class_id', cls.id);

            const response = await fetch('/api/upload-class-logo', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            toast.success("Logo uploaded successfully!");

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : "There was an error uploading the logo");
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <Card className="mb-6">
            <form onSubmit={uploadLogo}>
                <CardHeader className={"flex flex-row justify-between items-start "}>
                    <div>
                        <CardTitle>Class Logo</CardTitle>
                        <CardDescription>
                            Manage logo for <span className="font-medium">{cls.class_name}</span>.
                        </CardDescription>
                    </div>
                    <LoadingButton
                        type={"submit"}
                        loading={isLoading}
                        disabled={!files || files.length === 0}
                    >
                        Save
                    </LoadingButton>
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
                    <div className="w-80 min-h-full flex flex-col justify-center items-center border border-border rounded-md ml-4 bg-background">
                        {files && files.length > 0 ? (
                            files.map((file, idx) => (
                                <img
                                    key={idx}
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="object-contain mb-2 max-h-64"
                                />
                            ))
                        ) : (
                            <>

                                {logo_path && !imageError ? (
                                    <div className="relative flex items-center justify-center h-64 w-full">

                                        <img
                                            src={'/api/proxy-image?url=' + encodeURIComponent(logo_path)}
                                            alt="Class logo"
                                            className="object-contain mb-2 max-h-64"
                                            style={{ display: isLoading ? 'none' : 'block' }}
                                            onError={handleImageError}
                                            onLoad={handleImageLoad}
                                        />


                                    </div>

                                ) : (
                                    <div className="text-muted-foreground text-center p-4">
                                        {imageError ? (
                                            <div>
                                                <p>Failed to load image</p>
                                                <p className="text-xs mt-2 break-all">{logo_path}</p>
                                            </div>
                                        ) : (
                                            <p>No logo available</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}