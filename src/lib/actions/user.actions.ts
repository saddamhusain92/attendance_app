'use server';

import { z } from 'zod';
import dbConnect from '../mongodb';
import User from '@/models/user.model';
import { getSession, hashPassword } from '../auth';
import { revalidatePath } from 'next/cache';

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").or(z.literal('')),
}).refine(data => {
    if (data.password && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters",
    path: ["password"],
});


export async function updateUserProfile(formData: z.infer<typeof profileFormSchema>) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: 'Not authenticated.' };
        }
        
        await dbConnect();
        
        const validatedData = profileFormSchema.parse(formData);

        const { password, ...updateData } = validatedData;
        
        const updatePayload: Partial<IUser> & { password?: string } = { ...updateData };

        if (password) {
            updatePayload.password = await hashPassword(password);
        }
        
        await User.findByIdAndUpdate(session.userId, updatePayload);

        revalidatePath('/profile');
        revalidatePath('/dashboard');
        revalidatePath('/sk-admin/dashboard');

        return { success: true };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        console.error('Error updating profile:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
