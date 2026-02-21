import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { ActivityType, ActivityEntityType, ActivityMetadata } from '@/types/activity';
import { UserRole } from '@/types/user';
import mongoose from 'mongoose';

export interface CreateActivityInput {
    type: ActivityType;
    title: string;
    description: string;
    entityType: ActivityEntityType;
    entityId: mongoose.Types.ObjectId | string;
    actorRole: UserRole;
    targetRoles: UserRole[];
    metadata?: ActivityMetadata;
}

export interface ActorContext {
    userId: string;
    role: UserRole;
}

export function getTargetRolesForEntity(entityType: ActivityEntityType, type: ActivityType): UserRole[] {
    const base: UserRole[] = [UserRole.MANAGER];
    if (entityType === 'trip' || entityType === 'vehicle') base.push(UserRole.DISPATCHER);
    if (entityType === 'driver' || type === 'vehicle_maintenance_complete' || type === 'expense_maintenance')
        base.push(UserRole.SAFETY);
    if (entityType === 'expense' || type === 'trip_completed') base.push(UserRole.ANALYST);
    return [...new Set(base)];
}

export async function createActivity(input: CreateActivityInput): Promise<typeof Activity.prototype> {
    await dbConnect();
    const activity = new Activity({
        ...input,
        entityId: input.entityId,
        metadata: input.metadata ?? {},
        readBy: [],
    });
    return await activity.save();
}

export interface GetActivitiesOptions {
    userRole: UserRole;
    userId: string;
    cursor?: string;
    since?: string;
    limit?: number;
}

const ENTITY_HREF: Record<string, string> = {
    trip: '/trips',
    vehicle: '/vehicles',
    driver: '/drivers',
    expense: '/expenses',
};

const TYPE_HREF_OVERRIDE: Record<string, string> = {
    vehicle_maintenance_complete: '/maintenance',
    expense_maintenance: '/maintenance',
};

export async function getActivities({ userRole, userId, cursor, since, limit = 25 }: GetActivitiesOptions) {
    await dbConnect();
    const query: Record<string, unknown> = { targetRoles: userRole };
    if (since) {
        const sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
            query.createdAt = { $gt: sinceDate };
        }
    } else if (cursor) {
        const cursorDate = new Date(cursor);
        if (!isNaN(cursorDate.getTime())) {
            query.createdAt = { $lt: cursorDate };
        }
    }
    const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    const items = activities.map((a) => {
        const href = TYPE_HREF_OVERRIDE[a.type] ?? ENTITY_HREF[a.entityType] ?? '/dashboard';
        const read = Array.isArray(a.readBy) && a.readBy.some((id: unknown) => String(id) === userId);
        return {
            id: a._id.toString(),
            type: a.type,
            title: a.title,
            description: a.description,
            entityType: a.entityType,
            entityId: a.entityId?.toString(),
            href,
            metadata: a.metadata,
            read,
            createdAt: a.createdAt,
        };
    });

    const last = activities[activities.length - 1];
    const nextCursor = last ? last.createdAt.toISOString() : null;

    return { items, nextCursor };
}

export async function markActivitiesRead(activityIds: string[], userId: string) {
    await dbConnect();
    const validIds = activityIds.filter((id) => id && id.length > 0);
    if (validIds.length === 0) return;
    const userObjId = new mongoose.Types.ObjectId(userId);
    await Activity.updateMany(
        { _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) } },
        { $addToSet: { readBy: userObjId } }
    );
}
