"use client";
import {Button} from "@/components/ui/button";

export default function MoreInfoButton({homework}: {homework: {id: string}}) {
    return (                                                        <Button onClick={() => window.location.pathname = `homework/${homework.id}`}>More Info</Button>
)
}