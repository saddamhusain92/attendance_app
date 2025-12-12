'use client';

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
import { useEffect, useState } from "react";
import type { IAttendance } from "@/models/attendance.model";
import type { IUser } from "@/models/user.model";

interface PopulatedActivity extends Omit<IAttendance, 'employeeId'> {
    employeeId: Pick<IUser, '_id' | 'name'>;
}

type AdminDashboardData = {
    totalEmployees: number;
    presentToday: number;
    avgWorkHours: number;
    recentActivity: PopulatedActivity[];
};

export function AdminDashboardClient({ initialData }: { initialData: string }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const data: AdminDashboardData = JSON.parse(initialData, (key, value) => {
        if (['date', 'checkIn', 'checkOut', 'createdAt', 'updatedAt'].includes(key) && value) {
            return new Date(value);
        }
        return value;
    });

    const formatTime = (date: Date | null) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'p');
    };

    return (
        <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Total registered employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.presentToday} / {data.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Employees checked in today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Work Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.avgWorkHours.toFixed(2)}h</div>
                        <p className="text-xs text-muted-foreground">Average daily work hours this week</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentActivity.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentActivity.map((activity) => (
                                        <TableRow key={activity._id as string}>
                                            <TableCell className="font-medium">{activity.employeeId.name}</TableCell>
                                            <TableCell>{format(new Date(activity.date), "PPP")}</TableCell>
                                            <TableCell>{isClient ? formatTime(activity.checkIn) : '...'}</TableCell>
                                            <TableCell>{isClient ? formatTime(activity.checkOut) : '...'}</TableCell>
                                            <TableCell>
                                                {activity.checkOut ? (
                                                    <Badge variant="secondary">Completed</Badge>
                                                ) : activity.checkIn ? (
                                                    <Badge className="bg-green-600 text-white">Working</Badge>
                                                ) : (
                                                    <Badge variant="outline">Absent</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground">No recent attendance records found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
