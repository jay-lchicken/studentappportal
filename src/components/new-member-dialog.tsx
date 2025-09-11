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
export function NewMemberDialog({class_id}: {class_id: string}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const result = await fetch("/api/newmember", { method: "POST", body: JSON.stringify({ new_member_email: email,  class_id:class_id }) });
    if (!result?.ok) {
      setIsLoading(false);
      toast.error("There was an error adding the new member.");
      return;
    }
    setIsLoading(false);
    toast.success("New member added.")
    window.location.reload();


    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus /> New Member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Member</DialogTitle>
          <DialogDescription>Add a new member here</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Member's Emil</Label>
            <Input id="name-1" name="email" defaultValue="" />
          </div>

          <DialogFooter>
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