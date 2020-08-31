import { MongoClient, MongoError, Collection, OptionalId } from 'mongodb';
import { unmanaged, injectable } from 'inversify';
import { IConfig } from '../config/injector';
import { Logger } from 'winston';

@injectable()
export abstract class BaseDAL<T extends { _id?: any }> {

	private _collection: Collection<T>;

	constructor(
		@unmanaged() private config: IConfig,
		@unmanaged() private logger: Logger,
		name: string
	) {
		new MongoClient(this.config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true })
			.connect(async (error: MongoError, client: MongoClient) => {
				if (error) {
					this.logger.log('error', error.message, { ...error });
					return;
				};
				this._collection = client.db(this.config.db.name).collection(name);
			});
	}

	protected get collection(): Collection<T> {
		return this._collection;
	}

	async insertOne(document: OptionalId<T>): Promise<T> {
		const { result, insertedId } = await this.collection.insertOne(document);

		if (!result.ok) return Promise.reject({ message: `couldn't insert the document`, document });

		return { ...document, _id: insertedId } as T;
	}

	async insertMany(documents: OptionalId<T>[]): Promise<T[]> {
		const { result, insertedIds } = await this.collection.insertMany(documents);

		if (!result.ok) return Promise.reject({ message: `couldn't insert documents`, documents });

		return [...documents.map((document: OptionalId<T>, index: number) => { return { ...document, _id: insertedIds[index] } as T })];
	}

	getAll(): Promise<T[]> {
		return this.collection.find<T>({}).toArray();
	}

	getById(id: any): Promise<T> {
		return this.collection.findOne({ _id: id });
	}

	async update(document: T): Promise<T> {
		const { ok, value } = await this.collection.findOneAndUpdate({ _id: document._id }, document);
		if (!ok) return Promise.reject({ message: `couldn't update document`, document });

		return value;
	}
}