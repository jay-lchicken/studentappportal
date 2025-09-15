"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HomeworkToggleProps {
  homeworkId: number;
  completed: boolean;
}

export function HomeworkToggle({ homeworkId, completed }: HomeworkToggleProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/homework/toggle-complete', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeworkId,
          completed: !isCompleted
        }),
      });




      if (!response.ok) {
        throw new Error('Failed to update homework');
        toast.error("Failed to update homework status");
      }

      setIsCompleted(!isCompleted);

      toast.success(
        !isCompleted
          ? "Homework marked as completed!"
          : "Homework marked as incomplete"
      );


      router.refresh();
    } catch (error) {
      toast.error("Failed to update homework status");

      console.error('Error toggling homework:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`homework-${homeworkId}`}
        checked={isCompleted}
        onCheckedChange={toggleComplete}
        disabled={isLoading}
        className="w-5 h-5"
      />
      <label
        htmlFor={`homework-${homeworkId}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {isCompleted ? "Completed" : "Mark complete"}
      </label>
    </div>
  );
}
