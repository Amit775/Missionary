export class MSError extends Error {
	get name(): string { return this.name; }
	get statusCode(): number { return this.statusCode; }

	setStack(stack: any): MSError {
		this.stack = stack;
		return this;
	}
}

export class NotFoundError extends MSError {
	public get name(): string { return 'NotFoundError'; }
	public get statusCode(): number { return 401; }

	constructor(desiredResource: string) { super(`The resource '${desiredResource}' cannot be found`); }
}

export class MissingArgumentError extends MSError {
	public get name(): string { return 'MissingArgumentError'; }
	public get statusCode(): number { return 450; }
	constructor(public argumentName: string) { super(`The argument '${argumentName}' is missing.`) }
}

export class InvalidArgumentError extends MSError {
	public get name(): string { return 'InvalidArgumentError'; }
	public get statusCode(): number { return 451; }

	constructor(public argumentName: string, public argumentValue: string) { super(`The argument '${argumentName}' with value '${argumentValue}' is invalid.`) }
}

export class UnknownError extends MSError {
	public get name(): string { return 'UnknownError'; }
	public get statusCode(): number { return 500; }

	public static fromError(error: Error | string): UnknownError {
		if (error instanceof Error) {
			return new UnknownError(error.message).setStack(error.stack);
		} else if (typeof error === 'string') {
			return new UnknownError(error);
		} else {
			return new UnknownError('An unknown error occured');
		}
	}
}

export class ActionFailedError extends MSError {
	public get name(): string { return 'ActionFailedError'; }
	public get statusCode(): number { return 550; }

	constructor(actionName: string) { super(`The action '${actionName}' couldn't be performed successfully, try again.`) }
}