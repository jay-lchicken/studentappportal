import {Card, CardContent} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {AlertCircle, File, X} from "lucide-react";
import {Button} from "@/components/ui/button";

interface FileUploadCardProps {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    onCancel?: () => void;
    onRetry?: () => void;
    onRemove?: () => void;
}

export function FileUploadCard({
                                   file,
                                   progress,
                                   status,
                                   error,
                                   onCancel,
                                   onRetry,
                                   onRemove
                               }: FileUploadCardProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 max-w-full">
                    <div className="flex-shrink-0">
                        <File className="h-8 w-8 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0  " >
                        <div className="flex items-center justify-between mb-2 max-w-full">
                            <p className="text-sm font-medium truncate whitespace-nowrap overflow-hidden text-ellipsis ">  {file.name.length > 40 ? file.name.slice(0, 37) + '...' : file.name}
                            </p>
                            <div className="flex items-center gap-2">
                                {status === 'error' && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}


                                {status === 'success' || status ==='error' && onRemove && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={onRemove}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}

                                {status === 'uploading' && onCancel && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={onCancel}
                                        type={"button"}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{formatFileSize(file.size)}</span>
                            {status === 'success' && <span className="text-green-600">Upload complete</span>}
                            {status === 'error' && <span className="text-red-600">Upload failed</span>}
                        </div>

                        {status === 'uploading' && (
                            <Progress value={progress} className="h-2" />
                        )}

                        {status === 'error' && error && (
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-red-600">{error}</p>
                                {onRetry && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={onRetry}
                                        type={"button"}
                                    >
                                        Retry
                                    </Button>

                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
