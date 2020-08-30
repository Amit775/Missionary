export const INJECTOR: { [key: string]: symbol } = {
	MissionsBL: Symbol('IMissionBL'),
	MissionsDAL: Symbol('IMissionDAL'),
	Controllers: Symbol('IController'),
	Logger: Symbol('Logger'),
	Config: Symbol('IConfig'),
	Application: Symbol('Application')
}