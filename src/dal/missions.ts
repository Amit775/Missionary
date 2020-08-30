import { injectable } from 'inversify';

export interface IMissionDAL { }

@injectable()
export class MissionsDAL implements IMissionDAL { }