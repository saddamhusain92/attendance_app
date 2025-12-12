'use server';

import dbConnect from "../mongodb";
import { getSession } from "../auth";
import Attendance from "@/models/attendance.model";
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { revalidatePath } from "next/cache";

function getTodayDateString() {
    // Ensure this matches the timezone of your users if they are distributed.
    // For simplicity, we're using the server's local date.
    return format(new Date(), 'yyyy-MM-dd');
}

export async function checkIn() {
    try {
        await dbConnect();
        const session = await getSession();
        if (!session) {
            return { success: false, error: 'Not authenticated.' };
        }

        const today = getTodayDateString();
        
        const existingAttendance = await Attendance.findOne({ employeeId: session.userId, date: today });

        if (existingAttendance) {
            return { success: false, error: 'You have already checked in today.' };
        }

        const newAttendance = await Attendance.create({
            employeeId: session.userId,
            date: today,
            checkIn: new Date(),
        });
        
        revalidatePath('/dashboard');
        return { success: true, data: JSON.parse(JSON.stringify(newAttendance)) };

    } catch (error) {
        console.error('Check-in error:', error);
        return { success: false, error: 'An unexpected error occurred during check-in.' };
    }
}

export async function checkOut() {
    try {
        await dbConnect();
        const session = await getSession();
        if (!session) {
            return { success: false, error: 'Not authenticated.' };
        }

        const today = getTodayDateString();

        const attendance = await Attendance.findOne({ employeeId: session.userId, date: today });

        if (!attendance) {
            return { success: false, error: 'You have not checked in today.' };
        }

        if (attendance.checkOut) {
            return { success: false, error: 'You have already checked out today.' };
        }

        attendance.checkOut = new Date();
        const checkInTime = new Date(attendance.checkIn).getTime();
        const checkOutTime = attendance.checkOut.getTime();
        attendance.totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

        await attendance.save();

        revalidatePath('/dashboard');
        return { success: true, data: JSON.parse(JSON.stringify(attendance)) };

    } catch (error) {
        console.error('Check-out error:', error);
        return { success: false, error: 'An unexpected error occurred during check-out.' };
    }
}


export async function getDashboardData(userId: string) {
    await dbConnect();
    const today = getTodayDateString();

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({ employeeId: userId, date: today });
    
    // Get weekly stats
    const now = new Date();
    // Week starts on Monday
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekAttendances = await Attendance.find({
        employeeId: userId,
        date: {
            $gte: format(weekStart, 'yyyy-MM-dd'),
            $lte: format(weekEnd, 'yyyy-MM-dd')
        }
    });

    const weekStats = weekAttendances.reduce((acc, curr) => {
        acc.totalHours += curr.totalHours || 0;
        if(curr.checkIn) {
            acc.daysPresent += 1;
        }
        return acc;
    }, { totalHours: 0, daysPresent: 0 });

    const data = {
        today: todayAttendance ? JSON.parse(JSON.stringify(todayAttendance)) : null,
        weekStats: weekStats,
    };

    return data;
}


export async function getAttendanceHistory(userId: string) {
    try {
        await dbConnect();
        const history = await Attendance.find({ employeeId: userId }).sort({ date: -1 });
        return JSON.parse(JSON.stringify(history));
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        return [];
    }
}
