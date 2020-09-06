export const INJECTOR: { [key: string]: symbol } = {
	Application: Symbol('Application'),
	UsersBL: Symbol('IUsersBL'),
	UsersDAL: Symbol('IUsersDAL'),
	GroupsBL: Symbol('IGroupsBL'),
	GroupsDAL: Symbol('IGroupsDAL'),
	MissionsBL: Symbol('IMissionsBL'),
	MissionsDAL: Symbol('IMissionsDAL'),
	Controllers: Symbol('IController'),
	Logger: Symbol('Logger'),
	Config: Symbol('IConfig'),
}
