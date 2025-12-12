'use server';

import dbConnect from "../mongodb";
import User from "@/models/user.model";
import Attendance from "@/models/attendance.model";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword } from "../auth";
import { IUser } from "@/models/user.model";
import { IAttendance } from "@/models/attendance.model";

function getTodayDateString() {
    return format(new Date(), 'yyyy-MM-dd');
}

export async function getAdminDashboardData() {
    try {
        await dbConnect();

        // Total employees
        const totalEmployees = await User.countDocuments({ role: 'employee' });

        // Present today
        const today = getTodayDateString();
        const presentToday = await Attendance.countDocuments({
            date: today,
            checkIn: { $ne: null }
        });

        // Avg work hours this week
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const weekAttendances = await Attendance.find({
            date: {
                $gte: format(weekStart, 'yyyy-MM-dd'),
                $lte: format(weekEnd, 'yyyy-MM-dd')
            },
            totalHours: { $gt: 0 }
        });

        let totalWeekHours = 0;
        if (weekAttendances.length > 0) {
            totalWeekHours = weekAttendances.reduce((sum, record) => sum + record.totalHours, 0);
        }
        
        const avgWorkHours = totalWeekHours > 0 ? totalWeekHours / weekAttendances.length : 0;
        
        // Recent activity
        const recentActivity = await Attendance.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('employeeId', 'name');

        return {
            totalEmployees,
            presentToday,
            avgWorkHours,
            recentActivity: JSON.parse(JSON.stringify(recentActivity))
        };

    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return {
            totalEmployees: 0,
            presentToday: 0,
            avgWorkHours: 0,
            recentActivity: []
        };
    }
}


const employeeFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['employee', 'admin']),
    department: z.string().min(1, "Department is required"),
});

const employeeUpdateFormSchema = employeeFormSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters").or(z.literal('')),
});


export async function addEmployee(formData: z.infer<typeof employeeFormSchema>) {
    try {
        await dbConnect();
        const validatedData = employeeFormSchema.parse(formData);

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return { success: false, error: "An employee with this email already exists." };
        }

        const hashedPassword = await hashPassword(validatedData.password);
        
        await User.create({
            ...validatedData,
            password: hashedPassword,
        });

        revalidatePath('/sk-admin/employees');
        revalidatePath('/sk-admin/attendance');
        return { success: true };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        console.error('Error adding employee:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function updateEmployee(employeeId: string, formData: z.infer<typeof employeeUpdateFormSchema>) {
    try {
        await dbConnect();
        const validatedData = employeeUpdateFormSchema.parse(formData);

        const { password, ...updateData } = validatedData;
        
        const updatePayload: Partial<IUser> & { password?: string } = { ...updateData };

        if (password) {
            updatePayload.password = await hashPassword(password);
        }
        
        // Check if email is being changed and if it already exists
        if (updateData.email) {
            const existingUser = await User.findOne({ email: updateData.email, _id: { $ne: employeeId } });
            if (existingUser) {
                return { success: false, error: "An employee with this email already exists." };
            }
        }
        
        await User.findByIdAndUpdate(employeeId, updatePayload);

        revalidatePath('/sk-admin/employees');
        revalidatePath('/sk-admin/attendance');
        return { success: true };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        console.error('Error updating employee:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}


export async function getEmployees(): Promise<IUser[]> {
    try {
        await dbConnect();
        const employees = await User.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(employees));
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

export async function getEmployeeById(employeeId: string) {
    try {
        await dbConnect();
        const employee = await User.findById(employeeId);
        if (!employee) {
            return null;
        }
        return JSON.parse(JSON.stringify(employee)) as IUser;
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        return null;
    }
}


export async function deleteEmployee(employeeId: string) {
    try {
        await dbConnect();

        const employeeToDelete = await User.findById(employeeId);
        if (!employeeToDelete) {
            return { success: false, error: "Employee not found." };
        }

        if (employeeToDelete.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return { success: false, error: "Cannot delete the last admin user." };
            }
        }

        await User.findByIdAndDelete(employeeId);
        
        // Also delete associated attendance records
        await Attendance.deleteMany({ employeeId: employeeId });

        revalidatePath('/sk-admin/employees');
        revalidatePath('/sk-admin/attendance');
        return { success: true };

    } catch (error) {
        console.error('Error deleting employee:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function getAdminAttendance() {
    try {
        await dbConnect();
        const attendance = await Attendance.find({})
            .sort({ date: -1, createdAt: -1 })
            .populate('employeeId', 'name department');
        return JSON.parse(JSON.stringify(attendance));
    } catch (error) {
        console.error('Error fetching admin attendance data:', error);
        return [];
    }
}
