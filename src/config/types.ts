export const INJECTOR: { [key: string]: symbol } = {
	UsersBL: Symbol('IUsersBL'),
	UsersDAL: Symbol('IUsersDAL'),
	GroupsBL: Symbol('IGroupsBL'),
	GroupsDAL: Symbol('IGroupsDAL'),
	MissionsBL: Symbol('IMissionsBL'),
	MissionsDAL: Symbol('IMissionsDAL'),
	Controllers: Symbol('IController'),
	Logger: Symbol('Logger'),
	Config: Symbol('IConfig'),
	Application: Symbol('Application')
}