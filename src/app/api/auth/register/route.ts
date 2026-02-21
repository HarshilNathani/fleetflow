import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/types/user';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        await dbConnect();

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
        });

        return NextResponse.json(
            { message: 'User created successfully', user: { id: user._id, email: user.email } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}
