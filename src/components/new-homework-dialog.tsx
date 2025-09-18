"use client";

import {useState, useRef} from "react";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon, Plus, InfoIcon, X} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {Tooltip, TooltipContent, TooltipTrigger,} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {LoadingButton} from "@/components/ui/loading-button";
import {toast} from "sonner";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from "@/components/ui/shadcn-io/dropzone";
import {FileUploadCard} from "@/components/file-upload-card";

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  filePath?: string;
  originalName?: string;
}

export function NewHomeworkDialog({ classes }: { classes: any[] }) {
  const [files, setFiles] = useState<File[] | undefined>();
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDate, setOpenDate] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("10:30");
  const [links, setLinks] = useState<string[]>([]);
  function getDateTime(date: Date | undefined, time: string): Date | undefined {
    if (!date || !time) return undefined;
    const [hour, minute = "0", second = "0"] = time.split(":");
    const newDate = new Date(date);
    newDate.setHours(Number(hour), Number(minute), Number(second));
    return newDate;
  }

  const uploadFileWithProgress = async (file: File): Promise<{ file_path: string; original_name: string } | null> => {
    const fileId = `${file.name}-${Date.now()}`;
    const controller = new AbortController();
    abortControllers.current.set(fileId, controller);

    setUploadStates(prev => [...prev, {
      file,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      const formData = new FormData();
      formData.append('files', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadStates(prev => prev.map(state =>
              state.file === file ? { ...state, progress: percentComplete } : state
          ));
        }
      });

      return new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const fileData = response.files[0];
            setUploadStates(prev => prev.map(state =>
                state.file === file ? {
                  ...state,
                  progress: 100,
                  status: 'success',
                  filePath: fileData.file_path,
                  originalName: fileData.original_name
                } : state
            ));
            resolve(fileData);
          } else {
            const errorText = xhr.responseText || 'Upload failed';
            setUploadStates(prev => prev.map(state =>
                state.file === file ? {
                  ...state,
                  status: 'error',
                  error: errorText
                } : state
            ));
            reject(new Error(errorText));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadStates(prev => prev.map(state =>
              state.file === file ? {
                ...state,
                status: 'error',
                error: 'Network error occurred'
              } : state
          ));
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          setUploadStates(prev => prev.filter(state => state.file !== file));
          reject(new Error('Upload cancelled'));
        });

        controller.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

    } catch (error) {
      setUploadStates(prev => prev.map(state =>
          state.file === file ? {
            ...state,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : state
      ));
      return null;
    } finally {
      abortControllers.current.delete(fileId);
    }
  };

  const handleDrop = async (droppedFiles: File[]) => {
    console.log(droppedFiles);
    setFiles(droppedFiles);

    for (const file of droppedFiles) {
      uploadFileWithProgress(file);
    }
  };

  const handleCancelUpload = (file: File) => {
    for (const [fileId, controller] of abortControllers.current.entries()) {
      if (fileId.startsWith(file.name)) {
        controller.abort();
        break;
      }
    }
  };


  const handleRetryUpload = (file: File) => {
    setUploadStates(prev => prev.filter(state => state.file !== file));
    uploadFileWithProgress(file);
  };

  const handleRemoveFile = (file: File) => {
    setUploadStates(prev => prev.filter(state => state.file !== file));
    setFiles(prev => prev?.filter(f => f !== file));
  };

  function handleDateChange(selectedDate?: Date) {
    setDate(selectedDate);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTime(e.target.value);
  }
  function isValidUrl(string : string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();
    if (!date){
      toast.error("Please select a date");
      setIsLoading(false);
      return;
    }
    if (!time){
      toast.error("Please select a time");
      setIsLoading(false);
      return;
    }
    for (const link of links) {
      try {
        if (!isValidUrl(link)) throw new Error();
      } catch (_) {
        toast.error(`The link "${link}" is not a valid URL`);
        setIsLoading(false);
        return;
      }
    }
    for (const upload of uploadStates) {
        if (upload.status === 'uploading') {
            toast.error(`Please wait for all files to finish uploading and become green.`);
            setIsLoading(false);
            return;
        }
        if (upload.status === 'error') {
            toast.error(`Please remove or retry all failed uploads.`);
            setIsLoading(false);
            return;
        }
    }


    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "");
    if (!title){
      toast.error("Please enter a title");
      setIsLoading(false);
      return;
    }
    const due_date = getDateTime(date, time);
    const class_id = String(formData.get("class_id") ?? "no_class");
    const filePaths = uploadStates
        .filter(upload => upload.status === 'success' && upload.filePath && upload.originalName)
        .map(upload => ({
          file_path: upload.filePath!,
          original_name: upload.originalName!
        }));


    const result = await fetch("/api/homework/new-homework", { method: "POST", body: JSON.stringify({ title: title,  date:due_date , class_id:class_id, filePaths: filePaths, links: links}), headers: { "Content-Type": "application/json" } });
    if (!result?.ok) {
      setIsLoading(false);
      toast.error("There was an error adding the new homework.");
      return;
    }
    setIsLoading(false);
    toast.success("New homework added.")
    window.location.reload();


    setOpen(false);
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            <Plus /> New Homework
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>New Homework</DialogTitle>
            <DialogDescription>Add a new homework here</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title-1">Title</Label>
              <Input id="title-1" name="title" defaultValue="" />
              <div className="flex gap-4 ">
                <div className="flex flex-col gap-3 w-full">
                  <Label htmlFor="date-picker" className="px-1">Date</Label>
                  <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date-picker" className="justify-between font-normal">
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          onSelect={handleDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Label htmlFor="time-picker" className="px-1">Time</Label>
                  <Input
                      type="time"
                      id="time-picker"
                      step="1"
                      value={time}
                      onChange={handleTimeChange}
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>



              </div>
              <div className="flex flex-row gap-2">
                <Label htmlFor="select-1">Homework Connection</Label>
                <Tooltip>
                  <TooltipTrigger><InfoIcon size={16} /></TooltipTrigger>                <TooltipContent>
                  <p>When a class is selected, the homework will be added to everyone's homework list</p>
                </TooltipContent>
                </Tooltip>

              </div>


              <Select name={"class_id"} defaultValue="no_class">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_class">Personal Homework</SelectItem>

                  {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.class_name}</SelectItem>
                  ))}

                </SelectContent>
              </Select>


            </div>

            <div className="flex flex-col gap-2 end-0">
              <div className="flex flex-row gap-2">
                <Label htmlFor="select-1">Links (Optional)</Label>
                <Tooltip>
                  <TooltipTrigger><InfoIcon size={16} /></TooltipTrigger>                <TooltipContent>
                  <p>Add some resources as links</p>
                </TooltipContent>
                </Tooltip>

              </div>
              {!links.length && (<p className="text-sm text-muted-foreground">No links added</p>)}
              {links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                        type="text"
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index] = e.target.value;
                          setLinks(newLinks);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && link === '') {
                            const newLinks = [...links];
                            newLinks.splice(index, 1);
                            setLinks(newLinks);
                          }
                        }}
                        placeholder="Link"
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLinks = [...links];
                          newLinks.splice(index, 1);
                          setLinks(newLinks);
                        }}
                        className="px-2"
                    >
                      <X size={16} />
                    </Button>
                  </div>
              ))}
              <Button
                  variant="link"
                  className="self-end"
                  type={"button"}
                  onClick={ () => setLinks([...links, ""]) }
              >
                <Plus />Add More
              </Button>
            </div>
            <Dropzone
                accept={{ '': [] }}
                maxFiles={10}
                maxSize={1024 * 1024 * 500}
                minSize={1}
                onDrop={handleDrop}
                onError={console.error}
                src={files}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            {uploadStates.length > 0 && (
                <div className="space-y-2">
                  <Label>File Uploads</Label>
                  {uploadStates.map((uploadState, index) => (
                      <FileUploadCard
                          key={`${uploadState.file.name}-${index}`}
                          file={uploadState.file}
                          progress={uploadState.progress}
                          status={uploadState.status}
                          error={uploadState.error}
                          onCancel={() => handleCancelUpload(uploadState.file)}
                          onRetry={() => handleRetryUpload(uploadState.file)}
                          onRemove={() => handleRemoveFile(uploadState.file)}
                      />
                  ))}
                </div>
            )}

            <DialogFooter className={"gap-y-2"}>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <LoadingButton type="submit" loading={isLoading}>Add</LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
