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

export function NewExamDialog({ subjects }: { subjects: any[] }) {
  const [files, setFiles] = useState<File[] | undefined>();
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDate, setOpenDate] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("10:30");
  const [score, setScore] = useState<string>("");
  const [outOf, setOutOf] = useState<string>("");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();

    if (!date) {
      toast.error("Please select a date");
      setIsLoading(false);
      return;
    }
    if (!time) {
      toast.error("Please select a time");
      setIsLoading(false);
      return;
    }
    if (!score || !outOf) {
      toast.error("Please enter a score");
    }


    if (score !== "" || outOf !== "") {

      const scoreNum = parseInt(score);
      const outOfNum = parseInt(outOf);

      if (isNaN(scoreNum) || isNaN(outOfNum) || scoreNum < 0 || outOfNum < 1 || scoreNum > outOfNum) {
        toast.error("Please enter valid score values (score must be between 0 and out of value)");
        setIsLoading(false);
        return;
      }
    }

    for (const upload of uploadStates) {
      if (upload.status === 'uploading') {
        toast.error("Please wait for all files to finish uploading");
        setIsLoading(false);
        return;
      }
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const examData = {
      title: formData.get('title'),
      subject_id: formData.get('subject'),
      date_of_exam: getDateTime(date, time)?.toISOString(),
      score: score !== "" ? parseInt(score) : null,
      out_of: outOf !== "" ? parseInt(outOf) : null,
      uploaded_files: uploadStates
          .filter(state => state.status === 'success')
          .map(state => ({
            file_path: state.filePath,
            original_name: state.originalName
          }))
    };

    try {
      const response = await fetch('/api/exams/new-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Exam added successfully!");
      setOpen(false);
      form.reset();
      setDate(undefined);
      setTime("10:30");
      setScore("");
      setOutOf("");
      setFiles(undefined);
      setUploadStates([]);
      window.location.reload();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error(`Failed to add exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  const today = new Date();
  const disabledDays = {
    from: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    to: new Date(2030, 11, 31)
  };

  return (
      <Dialog open={open} onOpenChange={setOpen} >
        <DialogTrigger asChild>
          <Button className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Exam
          </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Exam</DialogTitle>
            <DialogDescription>
              Record details of a past exam. Only today and previous dates are allowed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                  id="title"
                  name="title"
                  placeholder="Enter exam title"
                  required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select name="subject" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.subject_name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover open={openDate} onOpenChange={setOpenDate}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                    >
                      {date ? date.toLocaleDateString() : "Pick a date"}
                      <ChevronDownIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        disabled={disabledDays}
                        initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="score">Score</Label>
                <Input
                    id="score"
                    type="number"
                    min="0"
                    placeholder="Enter score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="outOf">Out of</Label>
                <Input
                    id="outOf"
                    type="number"
                    min="1"
                    placeholder="Total marks"
                    value={outOf}
                    onChange={(e) => setOutOf(e.target.value)}
                />
              </div>
            </div>


            <div className="grid gap-2">
              <Label>Upload Files (optional)</Label>

              <Dropzone
                  onDrop={handleDrop}
                  maxFiles={10}
                  minSize={1}

                  maxSize={1024 * 1024 * 500}
                  onError={() => {
                    console.error;
                    toast.error("File upload exceeded the maximum size of 500MB or maximum number of files (10).");
                  }}
                  src={files}
                  accept={{ '': [] }}


              >
                <DropzoneEmptyState />
                <DropzoneContent />

              </Dropzone>

              {uploadStates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadStates.map((upload, index) => (
                        <FileUploadCard
                            key={index}
                            file={upload.file}
                            progress={upload.progress}
                            status={upload.status}
                            error={upload.error}
                            onCancel={() => handleCancelUpload(upload.file)}
                            onRetry={() => handleRetryUpload(upload.file)}
                            onRemove={() => handleRemoveFile(upload.file)}
                        />
                    ))}
                  </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={isLoading}>
                Add Exam
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
