import { Observable, bindNodeCallback } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
	MongoClient, MongoError, Collection, OptionalId, InsertOneWriteOpResult, WithId, InsertWriteOpResult, FilterQuery,
	FindOneOptions, Cursor, UpdateQuery, FindOneAndUpdateOption, FindAndModifyWriteOpResultObject, FindOneAndReplaceOption,
	CollectionInsertOneOptions, CollectionInsertManyOptions, CollectionAggregationOptions, AggregationCursor, BulkWriteOperation,
	CollectionBulkWriteOptions, BulkWriteOpResultObject, MongoCountPreferences, IndexOptions, IndexSpecification, ClientSession,
	DeleteWriteOpResultObject, MongoDistinctPreferences, FindOneAndDeleteOption, CollectionMapFunction, CollectionReduceFunction,
	MapReduceOptions, ReplaceOneOptions, ReplaceWriteOpResult, CollStats, UpdateManyOptions, UpdateWriteOpResult, UpdateOneOptions, CommonOptions
} from 'mongodb';
import { unmanaged, injectable } from 'inversify';
import { Logger } from 'winston';

import { IConfig } from '../config/injector';

type FlattenIfArray<T> = T extends Array<infer R> ? R : T;

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

	x() {
	}

	get aggregate$(): (pipeline?: object[], options?: CollectionAggregationOptions) => Observable<AggregationCursor<T>> {
		this.collection.aggregate = this.collection.aggregate.bind(this.collection);
		return bindNodeCallback<AggregationCursor<T>>(this.collection.aggregate);
	}

	get bulkWrite$(): (operations: Array<BulkWriteOperation<T>>, options?: CollectionBulkWriteOptions) => Observable<BulkWriteOpResultObject> {
		this.collection.bulkWrite = this.collection.bulkWrite.bind(this.collection);
		return bindNodeCallback(this.collection.bulkWrite);
	}

	get coundDocuments$(): (query?: FilterQuery<T>, options?: MongoCountPreferences) => Observable<number> {
		this.collection.count = this.collection.count.bind(this.collection);
		return bindNodeCallback(this.collection.count);
	}

	get createIndex$(): (fieldOrSpec: string | any, options?: IndexOptions) => Observable<string> {
		this.collection.createIndex = this.collection.createIndex.bind(this.collection);
		return bindNodeCallback<string>(this.collection.createIndex);
	}

	get createIndexes$(): (indexSpecs: IndexSpecification[], options?: { session?: ClientSession }) => Observable<any> {
		this.collection.createIndexes = this.collection.createIndexes.bind(this.collection);
		return bindNodeCallback<any>(this.collection.createIndexes);
	}

	get deleteMany$(): (filter: FilterQuery<T>, options?: CommonOptions) => Observable<DeleteWriteOpResultObject> {
		this.collection.deleteMany = this.collection.deleteMany.bind(this.collection);
		return bindNodeCallback(this.collection.deleteMany);
	}

	get deleteOne$(): (filter: FilterQuery<T>, options?: CommonOptions & { bypassDocumentValidation?: boolean }) => Observable<DeleteWriteOpResultObject> {
		this.collection.deleteOne = this.collection.deleteOne.bind(this.collection);
		return bindNodeCallback(this.collection.deleteOne);
	}

	get distinct$(): <Key extends keyof WithId<T>>(key: Key, query?: FilterQuery<T>, options?: MongoDistinctPreferences) => Observable<FlattenIfArray<WithId<T>[Key]>[]> {
		this.collection.distinct = this.collection.distinct.bind(this.collection);
		return bindNodeCallback(this.collection.distinct);
	}

	get drop$(): (options?: { seesion: ClientSession }) => Observable<any> {
		this.collection.drop = this.collection.drop.bind(this.collection);
		return bindNodeCallback(this.collection.drop);
	}

	get dropIndex$(): (indexName: string, options?: CommonOptions & { maxTimesMS?: number }) => Observable<any> {
		this.collection.dropIndex = this.collection.dropIndex.bind(this.collection);
		return bindNodeCallback(this.collection.dropIndex);
	}

	get dropIndexes$(): (options?: { session?: ClientSession, maxTimesMS?: number }) => Observable<any> {
		this.collection.dropIndexes = this.collection.dropIndexes.bind(this.collection);
		return bindNodeCallback(this.collection.dropIndexes);
	}

	get estimatedDocumentCount$(): (query: FilterQuery<T>, options?: MongoCountPreferences) => Observable<number> {
		this.collection.estimatedDocumentCount = this.collection.estimatedDocumentCount.bind(this.collection);
		return bindNodeCallback(this.collection.estimatedDocumentCount);
	}

	get find$(): (query: FilterQuery<T>, options?: FindOneOptions<T>) => Observable<T[]> {
		this.collection.find = this.collection.find.bind(this.collection);
		return (query: FilterQuery<T>, options?: FindOneOptions<T>) =>
			bindNodeCallback<FilterQuery<T>, FindOneOptions<T>, Cursor<T>>(this.collection.find)
				.call(query, options).pipe(switchMap((cursor: Cursor<T>) => cursor.toArray()));
	}

	get findOne$(): (query: FilterQuery<T>, options?: FindOneOptions<T>) => Observable<T> {
		this.collection.findOne = this.collection.findOne.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, T>(this.collection.findOne);
	}

	get findOneAndDelete$(): (filter: FilterQuery<T>, options?: FindOneAndDeleteOption<T>) => Observable<FindAndModifyWriteOpResultObject<T>> {
		this.collection.findOneAndDelete = this.collection.findOneAndDelete.bind(this.collection);
		return bindNodeCallback(this.collection.findOneAndDelete);
	}

	get findOneAndReplace$(): (filter: FilterQuery<T>, replacement: object, options?: FindOneAndReplaceOption<T>) => Observable<FindAndModifyWriteOpResultObject<T>> {
		this.collection.findOneAndReplace = this.collection.findOneAndReplace.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, FindAndModifyWriteOpResultObject<T>>(this.collection.findOneAndReplace);
	}

	get findOneAndUpdate$(): (filter: FilterQuery<T>, update: UpdateQuery<T> | T, options?: FindOneAndUpdateOption<T>) => Observable<FindAndModifyWriteOpResultObject<T>> {
		this.collection.findOneAndUpdate = this.collection.findOneAndUpdate.bind(this.collection);
		return bindNodeCallback<FilterQuery<T>, UpdateQuery<T> | T, FindAndModifyWriteOpResultObject<T>>(this.collection.findOneAndUpdate);
	}

	get indexes$(): (options?: { session?: ClientSession }) => Observable<any> {
		this.collection.indexes = this.collection.indexes.bind(this.collection);
		return bindNodeCallback(this.collection.indexes);
	}

	get indexExists$(): (indexes: string | string[], options?: { session: ClientSession }) => Observable<boolean> {
		this.collection.indexExists = this.collection.indexExists.bind(this.collection);
		return bindNodeCallback(this.collection.indexExists);
	}

	get indexInformation$(): (options?: { full: boolean, session: ClientSession }) => Observable<any> {
		this.collection.indexInformation = this.collection.indexInformation.bind(this.collection);
		return bindNodeCallback(this.collection.indexInformation);
	}

	get insertMany$(): (documents: OptionalId<T>[], options?: CollectionInsertManyOptions) => Observable<InsertWriteOpResult<WithId<T>>> {
		this.collection.insertMany = this.collection.insertMany.bind(this.collection);
		return bindNodeCallback<OptionalId<T>[], InsertWriteOpResult<WithId<T>>>(this.collection.insertMany);
	}

	get insertOne$(): (document: OptionalId<T>, options?: CollectionInsertOneOptions) => Observable<InsertOneWriteOpResult<WithId<T>>> {
		this.collection.insertOne = this.collection.insertOne.bind(this.collection);
		return bindNodeCallback<OptionalId<T>, InsertOneWriteOpResult<WithId<T>>>(this.collection.insertOne);
	}

	get isCapped$(): (options?: { session: ClientSession }) => Observable<any> {
		this.collection.isCapped = this.collection.isCapped.bind(this.collection);
		return bindNodeCallback(this.collection.isCapped);
	}

	get mapReduce$(): <TKey, TValue>(map: CollectionMapFunction<T> | string, reduce: CollectionReduceFunction<TKey, TValue> | string, options?: MapReduceOptions) => Observable<any> {
		this.collection.mapReduce = this.collection.mapReduce.bind(this.collection);
		return bindNodeCallback(this.collection.mapReduce);
	}

	get replaceOne$(): (filter: FilterQuery<T>, doc: T, options?: ReplaceOneOptions) => Observable<ReplaceWriteOpResult> {
		this.collection.replaceOne = this.collection.replaceOne.bind(this.collection);
		return bindNodeCallback(this.collection.replaceOne);
	}

	get stats$(): (options?: { scale: number, session?: ClientSession }) => Observable<CollStats> {
		this.collection.stats = this.collection.stats.bind(this.collection);
		return bindNodeCallback(this.collection.stats);
	}


	get updateMany$(): (filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>, options?: UpdateManyOptions) => Observable<UpdateWriteOpResult> {
		this.collection.updateMany = this.collection.updateMany.bind(this.collection);
		return bindNodeCallback(this.collection.updateMany);
	}

	get updateOne$(): (filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>, options?: UpdateOneOptions) => Observable<UpdateWriteOpResult> {
		this.collection.updateOne = this.collection.updateOne.bind(this.collection);
		return bindNodeCallback(this.collection.updateOne);
	}
}
