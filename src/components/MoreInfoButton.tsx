"use client";
import {Button} from "@/components/ui/button";

interface MoreInfoButtonProps {
    homework?: {id: string};
    exam?: {id: string};
    type?: 'homework' | 'exam';
}

export default function MoreInfoButton({homework, exam, type}: MoreInfoButtonProps) {
    const handleClick = () => {
        if (exam || type === 'exam') {
            const id = exam?.id || homework?.id;
            window.location.pathname = `exams/${id}`;
        } else {
            window.location.pathname = `homework/${homework?.id}`;
        }
    };

    return (
        <Button onClick={handleClick}>More Info</Button>
    );
}