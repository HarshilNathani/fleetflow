import mongoose, { Schema, Document, Model } from 'mongoose';
import { VehicleType } from './Vehicle';

export enum DriverStatus {
    AVAILABLE = 'available',
    ON_TRIP = 'on_trip',
    OFF_DUTY = 'off_duty',
    SUSPENDED = 'suspended',
}

export interface IDriver extends Document {
    name: string;
    licenseNumber: string;
    licenseExpiry: Date;
    allowedVehicleTypes: VehicleType[];
    status: DriverStatus;
    safetyScore: number;
}

const DriverSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        licenseNumber: { type: String, required: true, unique: true },
        licenseExpiry: { type: Date, required: true },
        allowedVehicleTypes: [{
            type: String,
            enum: Object.values(VehicleType),
            required: true,
        }],
        status: {
            type: String,
            enum: Object.values(DriverStatus),
            default: DriverStatus.AVAILABLE,
            required: true,
        },
        safetyScore: { type: Number, default: 100 },
    },
    { timestamps: true }
);

const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;
