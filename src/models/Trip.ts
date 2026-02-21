import mongoose, { Schema, Document, Model } from 'mongoose';

import { TripStatus } from '@/types/trip';

export interface ITrip extends Document {
    vehicleId: mongoose.Types.ObjectId;
    driverId: mongoose.Types.ObjectId;
    origin: string;
    destination: string;
    cargoWeight: number;
    revenue: number;
    startOdometer: number;
    endOdometer?: number;
    status: TripStatus;
}

const TripSchema: Schema = new Schema(
    {
        vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        cargoWeight: { type: Number, required: true },
        revenue: { type: Number, required: true },
        startOdometer: { type: Number, required: true },
        endOdometer: { type: Number },
        status: {
            type: String,
            enum: Object.values(TripStatus),
            default: TripStatus.DRAFT,
            required: true,
        },
    },
    { timestamps: true }
);

const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);

export default Trip;
