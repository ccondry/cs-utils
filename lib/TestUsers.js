// Javascript test users
var ORG_ID = '4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
	testUsers = [
	{
		id: 'eb78631c-3ed7-43b4-a2bc-aec5d803014d',
		name: 'fusion-mgmnt-530fbcbb-0fe6-46d8-b85b-bbf1b63c0d5a',
		orgId: ORG_ID,
		password: 'aaBB12$ed16c6d5-9726-4c98-b8a3-7be03af3d133'
	},
	{
		id: '20aa7bb4-c112-4477-8c8e-3d9c5e64ea13',
		name: 'fusion-mgmnt-0d9c0353-cd94-4db1-b5d6-7d3e60466865',
		orgId: ORG_ID,
		password: 'aaBB12$6fa4c53b-c426-45cb-ab2d-3f9f63000240'
	},
	{
		id: 'f526a08e-330e-4a4d-a09c-8701f454fe9e',
		name: 'fusion-mgmnt-c1f0fff5-a44e-4b04-809f-50cc852c54b8',
		orgId: ORG_ID,
		password: 'aaBB12$28f4e16d-f6dd-44c5-9660-97684d5b00c4'
	},
	{
		id: '7dfd2dce-2b51-49c9-a9cf-be3fcda1abcf',
		name: 'fusion-mgmnt-2ab9299d-c088-4443-9cd8-5cb80ac63889',
		orgId: ORG_ID,
		password: 'aaBB12$8eb540e8-7f79-4da9-abd9-ea38ea752651'
	},
	{
		id: 'bb07dc44-fccf-4b1a-baf5-029a081880b2',
		name: 'fusion-mgmnt-e2dea6da-c4ec-4df3-a47d-3eab6a8c9b79',
		orgId: ORG_ID,
		password: 'aaBB12$b28e56ec-a290-46b9-9742-6a2a664313d3'
	},
	{
		id: 'a5daa38d-bcae-4c6c-a910-6b21185fc007',
		name: 'fusion-mgmnt-b48d5cee-99ad-42cd-a2b2-832e5dec77d2',
		orgId: ORG_ID,
		password: 'aaBB12$04139b4b-3b56-4bbe-aae4-120208867672'
	},
	{
		id: '7f49dc29-ae82-4e2e-bd6e-fd02c56d5a94',
		name: 'fusion-mgmnt-bbeae8f0-0d36-47df-a186-8d4aa4c67235',
		orgId: ORG_ID,
		password: 'aaBB12$f1326504-5619-433b-a657-69f28a3de7bd'
	},
	{
		id: '3bf0bd90-ee5b-4c3a-b660-180b945a2c58',
		name: 'fusion-mgmnt-c1285869-0a1e-4815-8a45-672bd857f2e0',
		orgId: ORG_ID,
		password: 'aaBB12$fbdbdd44-0c6d-497d-835c-72d03ac05157'
	},

	{
		id: '730dc77f-b257-4eb8-837b-75d964791a33',
		name: 'fusion-mgmnt-c8f07d5a-3b07-48da-91d2-c4d8eababc71',
		orgId: ORG_ID,
		password: 'aaBB12$7e2c8067-016e-4e4b-a6e1-6ea53b9dcab8'
	},
	{
		id: '88c21097-4139-44f5-be05-72ced65a19aa',
		name: 'fusion-mgmnt-d0e07627-7809-41f7-ad52-350573b9421f',
		orgId: ORG_ID,
		password: 'aaBB12$09229b0c-2c16-4347-8a4f-b37011679c57'
	}
];

module.exports = {
	getNextTestUser : function(){
		var index = Math.floor(Math.random() * testUsers.length);
		return testUsers[index];
	}
};
