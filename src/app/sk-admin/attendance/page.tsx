import { PageTitle } from "@/components/shared/PageTitle";
import { getAdminAttendance, getEmployees } from "@/lib/actions/admin.actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceHistoryClient } from "@/components/employee/AttendanceHistoryClient";
import { IUser } from "@/models/user.model";

export default async function AdminAttendancePage() {
    const [attendanceData, employees] = await Promise.all([
        getAdminAttendance(),
        getEmployees()
    ]);
    
    const uniqueDepartments = [...new Set(employees.map(e => e.department).filter(Boolean))];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <PageTitle title="Attendance Management" description="View, filter, and export employee attendance records." />
            <Suspense fallback={<HistorySkeleton />}>
                <div className="mt-8">
                  <AttendanceHistoryClient 
                    initialData={JSON.stringify(attendanceData)} 
                    isAdmin={true} 
                    employees={employees.map(e => ({ _id: e._id, name: e.name }))} 
                    departments={uniqueDepartments}
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
