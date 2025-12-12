import { PageTitle } from "@/components/shared/PageTitle";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeById } from "@/lib/actions/admin.actions";
import { ProfileForm } from "@/components/auth/ProfileForm";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }

    const user = await getEmployeeById(session.userId);

    if (!user) {
        redirect('/');
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <PageTitle title="Profile Settings" description="Manage your account details and preferences." />
            <Suspense fallback={<ProfileSkeleton />}>
                <div className="mt-8 max-w-2xl mx-auto">
                    <ProfileForm user={JSON.parse(JSON.stringify(user))} />
                </div>
            </Suspense>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
        </div>
    );
}
