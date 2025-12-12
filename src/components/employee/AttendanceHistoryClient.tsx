'use client';

import { IAttendance } from "@/models/attendance.model";
import { IUser } from "@/models/user.model";
import { AttendanceTable } from "../shared/AttendanceTable";

interface PopulatedAttendance extends Omit<IAttendance, 'employeeId'> {
    employeeId: Pick<IUser, '_id' | 'name' | 'department'>;
}

type AttendanceHistoryClientProps = {
    initialData: string;
    isAdmin: boolean;
    employees: Pick<IUser, '_id' | 'name'>[];
    departments: string[];
}

export function AttendanceHistoryClient({ initialData, isAdmin, employees, departments }: AttendanceHistoryClientProps) {
    const history: PopulatedAttendance[] = JSON.parse(initialData, (key, value) => {
        if (['date', 'checkIn', 'checkOut'].includes(key) && value) {
            return new Date(value);
        }
        return value;
    });

    return (
        <AttendanceTable 
            initialData={history} 
            isAdmin={isAdmin}
            employees={employees}
            departments={departments}
        />
    );
}
