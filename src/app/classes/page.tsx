import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { auth0 } from "@/lib/auth0";
import {NewClassDialog} from "@/components/new-class-dialog";

export default async function Page() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" name={user?.name ?? ""} email={user?.email ?? ""} />
      <SidebarInset>
        <SiteHeader title="Classes" />

        <div className="justify-between flex flex-row p-4 pb-0">
          <h1 className="text-2xl font-medium ml-1">Classes</h1>
          <NewClassDialog />
        </div>

        <div className="grid md:grid-cols-4 grid-cols-1 gap-3 p-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Class 1</CardTitle>
              <CardDescription />
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Class 2</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Class 3</CardTitle>
              <CardDescription>Class 4</CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Class 5</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Class 6</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}