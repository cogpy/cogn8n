import type { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class OpenCogApi implements ICredentialType {
	name = 'openCogApi';

	displayName = 'OpenCog API';

	documentationUrl = 'opencog';

	icon: Icon = 'file:icons/opencog.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'http://localhost:5000',
			placeholder: 'http://localhost:5000',
			description: 'The URL of the OpenCog CogServer instance',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authentication (if required)',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for authentication (if required)',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for authentication (if required)',
		},
		{
			displayName: 'Connection Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Use Simulation Mode',
			name: 'useSimulation',
			type: 'boolean',
			default: true,
			description: 'Whether to use simulation mode when server is unavailable',
		},
	];
}
