"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";

export function NewSubjectDialog() {
  const [subjectName, setSubjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {    e.preventDefault();

    if (!subjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_name: subjectName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subject");
      }

      toast.success(`Subject "${subjectName}" created successfully!`);
    } catch (err) {
      toast.error("Failed to create subject. Please try again.");
    } finally {
      setIsLoading(false);
    }
    setOpen(false);
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            <Plus className="h-4 w-4 mr-2" /> New Subject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                  id="subject-name"
                  name="subjectName"
                  placeholder="e.g., Mathematics, History, Biology..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
              />
            </div>
            <DialogFooter  className={"gap-y-2"}>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <LoadingButton type="submit" loading={isLoading}>
                Create Subject
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
