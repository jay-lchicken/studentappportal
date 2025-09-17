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
import {useEffect} from "react";
import {toast} from "sonner";
import {LoadingButton} from "@/components/ui/loading-button";
export function NewClassDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const result = await fetch("/api/newclass", { method: "POST", body: JSON.stringify({ class_name: name }) });
    if (!result?.ok) {
      setIsLoading(false);
      toast.error("There was an error creating the [class].");
      return;
    }
    setIsLoading(false);
    toast.success("Class has been created.")
    window.location.reload();


    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus /> New Class
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Class</DialogTitle>
          <DialogDescription>Create a new class here</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Class Name</Label>
            <Input id="name-1" name="name" defaultValue="" />
          </div>

          <DialogFooter  className={"gap-y-2"}>
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