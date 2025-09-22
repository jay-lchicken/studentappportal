import {  AppSidebar } from "@/components/app-sidebar"
import { SidebarInset,  SidebarProvider } from "@/components/ui/sidebar"
import { Card,CardContent   } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator }  from "@/components/ui/separator"
import {SiteHeader} from "@/components/site-header"
import {NewSubjectDialog} from "@/components/new-subject-dialog"
import MoreInfoButton from "@/components/MoreInfoButton";
import {NewExamDialog}  from "@/components/new-exam-dialog";
import {DeleteExam} from "@/components/delete-exam";
import {DeleteSubject} from "@/components/delete-subject";
import {ChartLineMultiple} from "@/components/chart-line-multiple";
import {auth0} from "@/lib/auth0"; import {notFound} from "next/navigation";
import pool from "@/lib/db"; import crypto from "node:crypto";


interface Exam{
    id:number;title:string; date_of_exam:string;subject_name:string;paper_file_paths:number;subject_id:string;score?:number;out_of?:number}

interface Subject
{ id:number; subject_name:string;hash_userid:string }




export default async function Page( )
{


    let session =  await auth0.getSession( )
    let user=session?.user
    let hash_userid_email=crypto.createHash('sha256').update(`${user?.email??''}${user?.sub??''}`).digest('hex')


    if(!session)
    { notFound() }


    let {rows:subjectsRows}= await pool.query(
        'SELECT * FROM subjects_exam WHERE hash_userid = $1 ORDER BY subject_name',
        [hash_userid_email]) as {rows:Subject[]}
    console.log(hash_userid_email)

    let {rows:examRows}= await pool.query(`SELECT er.*,se.subject_name FROM exam_records er
                                                                                JOIN subjects_exam se
                                                                                     ON er.subject_id::int=se.id
                                           WHERE er.hash_userid_email=$1
                                           ORDER BY er.date_of_exam DESC`,[hash_userid_email]) as {rows:Exam[]}





    type ChartRow = {
        month:string
        [subject:string]:number|string
    }

    const now=new Date()
    const pastExams=examRows.filter((exam:Exam)=> new Date(exam.date_of_exam)<=now )
    const examsWithScores= pastExams.filter(x=>x.score!==null&&x.out_of!==null)

    //BuildMonthlyChartData is a alglorithm that i built with ai because it is a bit complex for me
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



    let chartData=buildMonthlyChartData(examsWithScores)


    return (

        <SidebarProvider>
            <AppSidebar variant="inset" name={user?.name??""} email={user?.email??""}/>
            <SidebarInset>
                <SiteHeader title={"Exams"}/>


                <div className="justify-between flex flex-row p-4 pb-0">
                    <h1 className="text-2xl font-medium ml-1">Past Exams</h1>
                    <div className="flex gap-2">
                        <NewSubjectDialog/>
                        <NewExamDialog subjects={subjectsRows}/>
                    </div>
                </div>


                <div className="p-4 space-y-6">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 justify-between">
                        <ChartLineMultiple data={chartData} />
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-2">Subjects</h2>
                                {subjectsRows.length === 0 ? (
                                    <div className="text-center text-muted-foreground">No subjects created yet.</div>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {subjectsRows.map(subject => (
                                            <div key={subject.id} className="flex items-center justify-between p-2 rounded-lg border bg-secondary/50">
                                                <Badge variant="secondary">{subject.subject_name}</Badge>
                                                <DeleteSubject
                                                    subjectId={subject.id.toString()}
                                                    subjectName={subject.subject_name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>


                    <Separator/>


                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Past Exams</h2>
                            <Badge variant="default">{pastExams.length}</Badge>
                        </div>


                        {pastExams.length===0?
                            (<Card><CardContent className="p-6 text-center text-muted-foreground">No past exams recorded yet.</CardContent></Card>)

                            :

                            (<div className="grid gap-4">
                                    {pastExams.map(exam=>(

                                        <Card key={exam.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{exam.title}</h3>
                                                            <Badge variant="secondary">{exam.subject_name}</Badge>
                                                            {exam.score!==null&&exam.out_of!==null&&exam.score!==undefined&&exam.out_of!==undefined&&(
                                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{exam.score}/{exam.out_of} ({Math.round((exam.score/exam.out_of)*100)}%)</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{new Date(exam.date_of_exam).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <MoreInfoButton exam={{id:exam.id.toString()}} type="exam"/>
                                                        <DeleteExam examId={exam.id.toString()} examTitle={exam.title}/>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                    ))}
                                </div>
                            )}
                    </div>
                </div>


            </SidebarInset>
        </SidebarProvider>

    )

}