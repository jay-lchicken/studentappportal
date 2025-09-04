"use client";

import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import {useRouter} from "next/navigation";
import {LoadingButton} from "@/components/ui/loading-button";
export function GoToClass({url}: {url: string}) {

    const router = useRouter();




    return (
        <LoadingButton size={"icon"} variant={"outline"} className={"mr-4"} onClick={()=> router.push(`/${url}`)}><ArrowRight/></LoadingButton>


    );
}