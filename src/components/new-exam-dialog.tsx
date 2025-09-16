"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon, Plus, BadgeInfoIcon, InfoIcon} from "lucide-react";
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

export function NewExamDialog({ classes }: { classes: any[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDate, setOpenDate] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("10:30");
  function getDateTime(date: Date | undefined, time: string): Date | undefined {
    if (!date || !time) return undefined;
    const [hour, minute = "0", second = "0"] = time.split(":");
    const newDate = new Date(date);
    newDate.setHours(Number(hour), Number(minute), Number(second));
    return newDate;
  }

  function handleDateChange(selectedDate?: Date) {
    setDate(selectedDate);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTime(e.target.value);
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

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "");
    if (!title){
        toast.error("Please enter a title");
        setIsLoading(false);
        return;
    }
    const due_date = getDateTime(date, time);
    const class_id = String(formData.get("class_id") ?? "no_class");

    const result = await fetch("/api/homework/new-homework", { method: "POST", body: JSON.stringify({ title: title,  date:due_date , class_id:class_id }), headers: { "Content-Type": "application/json" } });
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

        <DialogContent className="sm:max-w-[425px]">
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