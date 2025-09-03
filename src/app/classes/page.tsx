import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {auth0} from "@/lib/auth0";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
export default async function Page() {
    const session = await auth0.getSession();
    const user = session?.user;
    return (
        <SidebarProvider >
            <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""}/>
            <SidebarInset>
                <SiteHeader title={"Classes"}/>
                <div className={"justify-between flex flex-row p-4 pb-0"}>
                    <h1 className={"text-2xl font-medium ml-1 "}>Classes</h1>
                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Plus/>New Class</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>New Class</DialogTitle>
                                    <DialogDescription>
                                        Create a new class here
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name-1">Name</Label>
                                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                                    </div>

                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Add</Button>
                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>

                </div>
                <div className="grid md:grid-cols-4 grid-cols-1 gap-3 p-4">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Class 1</CardTitle>
                            <CardDescription>


                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Class 2</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Class 3</CardTitle>
                            <CardDescription>
                                Class 4
                            </CardDescription>
                        </CardHeader>
                    </Card>


                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Class 5</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Class 6</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                    </Card>



                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
