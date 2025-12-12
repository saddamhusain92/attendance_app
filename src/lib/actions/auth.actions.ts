'use server';

import { z } from 'zod';
import dbConnect from '../mongodb';
import User from '@/models/user.model';
import { createSession, comparePasswords, hashPassword, deleteSession } from '../auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const seedUsers = [
    {
        email: 'john@company.com',
        password: 'password123',
        name: 'John Doe',
        role: 'employee' as const,
        department: 'Engineering',
    },
    {
        email: 'jane@company.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'employee' as const,
        department: 'Marketing',
    }
];

export async function login(formData: z.infer<typeof loginSchema>) {
  let user;
  try {
    const validatedData = loginSchema.parse(formData);
    await dbConnect();

    user = await User.findOne({ email: validatedData.email }).select('+password');

    // Special case for the first admin login
    if (validatedData.email === 'admin@company.com' && !user) {
        if (validatedData.password === 'admin123') {
            const hashedPassword = await hashPassword('admin123');
            user = await User.create({
                email: 'admin@company.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                department: 'Administration',
            });
        }
    }

    // Seed employee users for demo
    if (!user) {
        const seedUser = seedUsers.find(u => u.email === validatedData.email);
        if (seedUser && validatedData.password === seedUser.password) {
            const existingUser = await User.findOne({ email: seedUser.email });
            if (!existingUser) {
              const hashedPassword = await hashPassword(seedUser.password);
              user = await User.create({
                  ...seedUser,
                  password: hashedPassword,
              });
            } else {
              // Ensure we have the password field if the user exists
              user = await User.findOne({ email: seedUser.email }).select('+password');
            }
        }
    }

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const passwordsMatch = await comparePasswords(validatedData.password, user.password);
    if (!passwordsMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    await createSession(user._id.toString(), user.role, user.name, user.email);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid data provided.' };
    }
    console.error(error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }

  // Redirect after successful login and session creation
  const redirectUrl = user.role === 'admin' ? '/sk-admin/dashboard' : '/dashboard';
  redirect(redirectUrl);
}

export async function logout() {
  deleteSession();
  redirect('/');
}
