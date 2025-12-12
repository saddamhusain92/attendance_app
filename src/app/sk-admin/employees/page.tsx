import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { getEmployees } from "@/lib/actions/admin.actions";
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
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog";
import { Suspense } from "react";
import { EmployeeActions } from "@/components/admin/EmployeeActions";
import { IUser } from "@/models/user.model";

export default async function EmployeeManagementPage() {
    const employees: IUser[] = await getEmployees();

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between">
                <PageTitle title="Employee Management" description="Add, edit, and manage employee records." />
                <Suspense fallback={<Button disabled>Add Employee</Button>}>
                    <AddEmployeeDialog />
                </Suspense>
            </div>
            <div className="mt-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    {employees.length > 0 ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee._id as string}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.department}</TableCell>
                                        <TableCell>
                                            <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                                                {employee.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(employee.createdAt), "PPP")}</TableCell>
                                        <TableCell className="text-right">
                                            <Suspense fallback={<div>...</div>}>
                                                <EmployeeActions employee={JSON.parse(JSON.stringify(employee))} />
                                            </Suspense>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="p-4 text-center text-muted-foreground">No employees found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
