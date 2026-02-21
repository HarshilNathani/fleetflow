import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/types/user';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
        },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
