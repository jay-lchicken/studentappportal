"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {Button} from "@/components/ui/button";
import {TrashIcon} from "lucide-react";

interface HomeworkToggleProps {
    homeworkId: number;
}

export function DeleteHomeworkButton({ homeworkId }: HomeworkToggleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const deleteHomework = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/homework/delete-homework', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    homeworkId,
                }),
            });
            if (response.ok){
                toast.success("Homework deleted successfully");
                if (window.location.pathname == '/homework/'+homeworkId){
                    window.location.href = '/homework';
                }
            }




            if (!response.ok) {
                throw new Error('Failed to delete homework');
                toast.error("Failed to delete homework");
            }



            router.refresh();
        } catch (error) {
            toast.error("Failed to update homework status");

            console.error('Error toggling homework:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="icon"
            variant="destructive"
            onClick={deleteHomework}
            disabled={isLoading}
            aria-label="Delete homework"
        >
            <TrashIcon />
        </Button>
    );
}
