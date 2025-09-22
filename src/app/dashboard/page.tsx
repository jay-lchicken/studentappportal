import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"
import {auth0} from "@/lib/auth0";
import {notFound} from "next/navigation";
import pool from "@/lib/db";
import crypto from "node:crypto";
import {ChartLineMultiple} from "@/components/chart-line-multiple";

interface Exam{
    id:number;title:string; date_of_exam:string;subject_name:string;paper_file_paths:number;subject_id:string;score?:number;out_of?:number}

interface Subject
{ id:number; subject_name:string;hash_userid:string }

export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    if (!session) {
        notFound()

    }
    const hash_userid_email = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');





    let {rows:examRows}= await pool.query(`SELECT er.*,se.subject_name FROM exam_records er
                                                                                JOIN subjects_exam se
                                                                                     ON er.subject_id::int=se.id
                                           WHERE er.hash_userid_email=$1
                                           ORDER BY er.date_of_exam DESC`,[hash_userid_email]) as {rows:Exam[]}





    type ChartRow = {
        month:string
        [subject:string]:number|string
    }
    function buildMonthlyChartData(records:Exam[]):ChartRow[]{
        const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"]

        let subjects = new Set<string>()
        let agg=new Map<string,{label:string;sums:Record<string,number>;counts:Record<string,number>;year:number;monthIdx:number}>()

        for (let r of records){

            let d=new Date(r.date_of_exam)
            if (isNaN(d.getTime())) continue

            let y = d.getFullYear( ) ; let m=d.getMonth()
            let k=`${y}-${String(m+1).padStart(2,"0")}`
            let e=agg.get(k)
            if(!e){e={label:`${monthNames[m]} ${y}`,sums:{},counts:{},year:y,monthIdx:m};agg.set(k,e)}

            let subj=r.subject_name
            subjects.add(subj)
            let p=r.score&&r.out_of?(r.score/r.out_of)*100:0
            e.sums[subj]=(e.sums[subj]??0)+p
            e.counts[subj]=(e.counts[subj]??0)+1

        }

        return Array.from(agg.values())
            .sort((a,b)=>a.year-b.year||a.monthIdx-b.monthIdx)
            .map(({label,sums,counts})=>{
                let row:ChartRow={month:label}
                for (let s of subjects){ if(counts[s]){ let mean=sums[s]/counts[s];row[s]=Math.round(mean*100)/100 }}
                return row
            })
    }
    const hash_email_userid = crypto.createHash('sha256').update(`${user?.email ?? ''}${user?.sub ?? ''}`).digest('hex');

    const { rows : homeworkRows} = await pool.query(
        `SELECT
             h.*,
             c.class_name as class_name
         FROM homework h
                  LEFT JOIN classes c ON h.class_id_link::uuid = c.id
         WHERE h.personal_hashid = $1
         ORDER BY h.due_date ASC, h.date_created DESC`,
        [hash_email_userid]
    );
    const { rows: classesRows } = await pool.query(
        `SELECT * FROM class_user
                           JOIN classes ON class_user.class_id = classes.id
         WHERE class_user.hash_userid = $1`,
        [hash_email_userid]
    );
    return (
        <SidebarProvider >
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} classes={classesRows}/>
            <SidebarInset>
                <SiteHeader  title={"Dashboard"}/>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <SectionCards homeworks={homeworkRows   } data={buildMonthlyChartData(examRows)}/>

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
