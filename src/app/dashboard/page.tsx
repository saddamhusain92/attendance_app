import { PageTitle } from "@/components/shared/PageTitle";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/actions/employee.actions";
import { DashboardClient } from "@/components/employee/DashboardClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'employee') {
        redirect('/');
    }

    const data = await getDashboardData(session.userId);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <PageTitle title={`Welcome back, ${session.name}!`} description="Here's your attendance overview for today and this week." />
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardClient initialData={JSON.stringify(data)} />
            </Suspense>
        </div>
    );
}

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
