import { ObjectId } from 'mongodb';

export class Node {
	_id: ObjectId;
	name: string;
	hierarchy: string[];
	parent: ObjectId;
	children: ObjectId[];
}
