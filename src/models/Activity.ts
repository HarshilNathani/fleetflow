import mongoose, { Schema, Document, Model } from 'mongoose';
import { ActivityType, ActivityEntityType } from '@/types/activity';

export interface IActivity extends Document {
    type: ActivityType;
    title: string;
    description: string;
    entityType: ActivityEntityType;
    entityId: mongoose.Types.ObjectId;
    actorRole: string;
    targetRoles: string[];
    metadata: Record<string, unknown>;
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
    {
        type: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        entityType: { type: String, required: true },
        entityId: { type: Schema.Types.ObjectId, required: true },
        actorRole: { type: String, required: true },
        targetRoles: [{ type: String, required: true }],
        metadata: { type: Schema.Types.Mixed, default: {} },
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    },
    { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ targetRoles: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1 });

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
