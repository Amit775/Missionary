import { Observable, bindNodeCallback, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MongoClient, MongoError, Collection, OptionalId, InsertOneWriteOpResult, WithId, InsertWriteOpResult, FilterQuery, FindOneOptions, Cursor, UpdateQuery, FindOneAndUpdateOption, FindAndModifyWriteOpResultObject, FindOneAndReplaceOption, CollectionInsertOneOptions, CollectionInsertManyOptions } from 'mongodb';
import { unmanaged, injectable } from 'inversify';
import { IConfig } from '../config/injector';
import { Logger } from 'winston';

@injectable()
export abstract class BaseDAL<T extends { _id?: any }> {

	private collection: Collection<T>;

	constructor(
		@unmanaged() private config: IConfig,
		@unmanaged() private logger: Logger,
		name: string
	) {
		new MongoClient(this.config.db.uri, { useNewUrlParser: true, useUnifiedTopology: true })
			.connect((error: MongoError, client: MongoClient) => {
				if (error) {
					console.log(error.message);
					return;
				};
				this.collection = client.db(this.config.db.name).collection(name);
				this.logger.log('info', 'db connected successfully to collection ' + name);
			});
	}

	get insertOne$(): (document: OptionalId<T>, options?: CollectionInsertOneOptions) => Observable<InsertOneWriteOpResult<WithId<T>>> {
		this.collection.insertOne = this.collection.insertOne.bind(this.collection);
		return bindNodeCallback<OptionalId<T>, InsertOneWriteOpResult<WithId<T>>>(this.collection.insertOne);
	}

	get insertMany$(): (documents: OptionalId<T>[], options?: CollectionInsertManyOptions) => Observable<InsertWriteOpResult<WithId<T>>> {
		this.collection.insertMany = this.collection.insertMany.bind(this.collection);
		return bindNodeCallback<OptionalId<T>[], InsertWriteOpResult<WithId<T>>>(this.collection.insertMany);
	}

	get find$(): (query: FilterQuery<T>, options?: FindOneOptions<T>) => Observable<Cursor<T>> {
		this.collection.find = this.collection.find.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, Cursor<T>>(this.collection.find);
	}

	get findOne$(): (query: FilterQuery<T>, options?: FindOneOptions<T>) => Observable<T> {
		this.collection.findOne = this.collection.findOne.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, T>(this.collection.findOne);
	}

	get findOneAndUpdate$(): (filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: FindOneAndUpdateOption<T>) => Observable<FindAndModifyWriteOpResultObject<T>> {
		this.collection.findOneAndUpdate = this.collection.findOneAndUpdate.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, UpdateQuery<T> | T, FindAndModifyWriteOpResultObject<T>>(this.collection.findOneAndUpdate);
	}

	get findOneAndReplace$(): (filter: FilterQuery<T>, replacement: object, options?: FindOneAndReplaceOption<T>) => Observable<FindAndModifyWriteOpResultObject<T>> {
		this.collection.findOneAndReplace = this.collection.findOneAndReplace.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, FindAndModifyWriteOpResultObject<T>>(this.collection.findOneAndReplace);
	}

	insertOne(document: OptionalId<T>): Observable<T> {
		return this.insertOne$(document).pipe(
			map(({ insertedId }) => { return { ...document, _id: insertedId } as T })
		);
	}

	insertMany(documents: OptionalId<T>[]): Observable<T[]> {
		return this.insertMany$(documents).pipe(
			map(({ insertedIds }) => [...documents.map((document: OptionalId<T>, index: number) => {
				return { ...document, _id: insertedIds[index] } as T
			})])
		);
	}

	getAll(): Observable<T[]> {
		return this.find$({}).pipe(switchMap(cursor => from(cursor.toArray())));
	}

	getById(id: any): Observable<T> {
		return this.findOne$({ _id: id });
	}

	update(document: T): Observable<T> {
		return this.findOneAndUpdate$({ _id: document._id }, { ...document, ...document }).pipe(map(x => x.value));
	}
}