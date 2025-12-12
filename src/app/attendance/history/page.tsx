import { PageTitle } from "@/components/shared/PageTitle";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAttendanceHistory } from "@/lib/actions/employee.actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceHistoryClient } from "@/components/employee/AttendanceHistoryClient";
import { IAttendance } from "@/models/attendance.model";
import { IUser } from "@/models/user.model";

export default async function AttendanceHistoryPage() {
    const session = await getSession();
    if (!session || session.role !== 'employee') {
        redirect('/');
    }

    const history: IAttendance[] = await getAttendanceHistory(session.userId);

    const dataWithEmployee = history.map(h => ({ ...h, employeeId: { _id: session.userId, name: session.name } as IUser }));

    return (
        <div className="container mx-auto p-4 md:p-8">
            <PageTitle title="Attendance History" description="View and filter your past attendance records." />
            <Suspense fallback={<HistorySkeleton />}>
                <div className="mt-8">
                  <AttendanceHistoryClient 
                    initialData={JSON.stringify(dataWithEmployee)} 
                    isAdmin={false} 
                    employees={[]} 
                    departments={[]}
                  />
                </div>
            </Suspense>
        </div>
    );
}

function HistorySkeleton() {
    return (
        <div className="mt-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
