import { ObjectId } from 'mongodb';

export class TreeNode {
	_id: ObjectId;
	name: string;
	hierarchy: string[];
	parent: ObjectId;
	children: ObjectId[];
}
