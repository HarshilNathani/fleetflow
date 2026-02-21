import dbConnect from '@/lib/mongodb';
import Driver, { IDriver } from '@/models/Driver';

export async function getAllDrivers() {
    await dbConnect();
    return await Driver.find({});
}

export async function createDriver(data: Partial<IDriver>) {
    await dbConnect();
    const driver = new Driver(data);
    return await driver.save();
}

export async function getDriverById(id: string) {
    await dbConnect();
    return await Driver.findById(id);
}

export async function updateDriver(id: string, data: Partial<IDriver>) {
    await dbConnect();
    return await Driver.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteDriver(id: string) {
    await dbConnect();
    return await Driver.findByIdAndDelete(id);
}
