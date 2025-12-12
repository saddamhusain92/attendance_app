import { PageTitle } from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, UserCheck, Activity } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { IAttendance } from "@/models/attendance.model";
import type { IUser } from "@/models/user.model";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminDashboardData } from "@/lib/actions/admin.actions";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

function DashboardSkeleton() {
    return (
        <div className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-80" />
        </div>
    );
}

export default async function AdminDashboardPage() {
    const data = await getAdminDashboardData();

    return (
        <div className="container mx-auto p-4 md:p-8">
            <PageTitle title="Admin Dashboard" description="Overview of the system and employee attendance." />
            <Suspense fallback={<DashboardSkeleton />}>
                <AdminDashboardClient initialData={JSON.stringify(data)} />
            </Suspense>
        </div>
    );
}
