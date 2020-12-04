import { inject } from 'inversify';
import { InsertOneWriteOpResult, ObjectId } from 'mongodb';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IConfig } from 'src/config/injector';
import { INJECTOR } from 'src/config/types';
import { TreeNode } from 'src/models/tree-node';
import { Logger } from 'winston';
import { BaseDAL } from './base';

export class TreeNodesDAL extends BaseDAL<TreeNode> {
	constructor(
		@inject(INJECTOR.Config) config: IConfig,
		@inject(INJECTOR.Logger) logger: Logger,
	) { super(config, logger, 'tree-nodes'); }

	findNodeByName(name: string): Observable<TreeNode> {
		return this.findOne$({ name });
	}

	findNodeById(id: ObjectId): Observable<TreeNode> {
		return this.findOne$({ _id: id });
	}

	createNode(node: TreeNode): Observable<TreeNode> {
		return this.insertOne$(node).pipe(map((result: InsertOneWriteOpResult<TreeNode>) => result.ops[0]));
	}	
}