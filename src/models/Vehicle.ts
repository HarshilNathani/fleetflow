import mongoose, { Schema, Document, Model } from 'mongoose';

import { VehicleType, VehicleStatus } from '@/types/vehicle';

export interface IVehicle {
    name: string;
    model: string;
    licensePlate: string;
    type: VehicleType;
    maxCapacity: number;
    odometer: number;
    acquisitionCost: number;
    status: VehicleStatus;
}

const VehicleSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        model: { type: String, required: true },
        licensePlate: { type: String, required: true, unique: true },
        type: {
            type: String,
            enum: Object.values(VehicleType),
            required: true,
        },
        maxCapacity: { type: Number, required: true },
        odometer: { type: Number, required: true },
        acquisitionCost: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(VehicleStatus),
            default: VehicleStatus.AVAILABLE,
            required: true,
        },
    },
    { timestamps: true }
);

VehicleSchema.index({ licensePlate: 1 }, { unique: true });

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
