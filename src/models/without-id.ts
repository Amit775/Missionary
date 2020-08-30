import { ObjectId } from 'mongodb';

export type WithoutId<T extends { Id: ObjectId | string }> = Omit<T, 'Id'>
