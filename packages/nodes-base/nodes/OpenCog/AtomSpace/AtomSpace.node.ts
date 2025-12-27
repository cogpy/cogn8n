import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { OpenCogClient, type OpenCogCredentials } from '../client/OpenCogClient';

export class AtomSpace implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCog AtomSpace',
		name: 'atomSpace',
		icon: 'file:atomspace.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Semantic knowledge representation using OpenCog AtomSpace',
		defaults: {
			name: 'AtomSpace',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'openCogApi',
				required: false,
				displayOptions: {
					show: {
						useCredentials: [true],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Use Credentials',
				name: 'useCredentials',
				type: 'boolean',
				default: false,
				description: 'Whether to use OpenCog API credentials for real server connection',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'addAtom',
				options: [
					{
						name: 'Add Atom',
						value: 'addAtom',
						description: 'Add a new atom to the AtomSpace',
						action: 'Add an atom to the AtomSpace',
					},
					{
						name: 'Get Truth Value',
						value: 'getTruthValue',
						description: 'Get the truth value of an atom',
						action: 'Get truth value of an atom',
					},
					{
						name: 'Pattern Match',
						value: 'patternMatch',
						description: 'Perform pattern matching in the AtomSpace',
						action: 'Perform pattern matching',
					},
					{
						name: 'Query Atoms',
						value: 'queryAtoms',
						description: 'Query atoms from the AtomSpace',
						action: 'Query atoms from the AtomSpace',
					},
					{
						name: 'Set Truth Value',
						value: 'setTruthValue',
						description: 'Set the truth value of an atom',
						action: 'Set truth value of an atom',
					},
				],
			},
			// Add Atom fields
			{
				displayName: 'Atom Type',
				name: 'atomType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['addAtom'],
					},
				},
				default: 'ConceptNode',
				options: [
					{
						name: 'ConceptNode',
						value: 'ConceptNode',
						description: 'Represents a concept or entity',
					},
					{
						name: 'EvaluationLink',
						value: 'EvaluationLink',
						description: 'Represents evaluation of a predicate',
					},
					{
						name: 'InheritanceLink',
						value: 'InheritanceLink',
						description: 'Represents inheritance relationship',
					},
					{
						name: 'LinkNode',
						value: 'LinkNode',
						description: 'Represents a link between atoms',
					},
					{
						name: 'PredicateNode',
						value: 'PredicateNode',
						description: 'Represents a predicate or relation',
					},
					{
						name: 'SimilarityLink',
						value: 'SimilarityLink',
						description: 'Represents similarity relationship',
					},
				],
			},
			{
				displayName: 'Atom Name',
				name: 'atomName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['addAtom', 'queryAtoms', 'getTruthValue', 'setTruthValue'],
					},
				},
				default: '',
				description: 'The name or identifier of the atom',
			},
			{
				displayName: 'Truth Value',
				name: 'truthValue',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						operation: ['addAtom', 'setTruthValue'],
					},
				},
				default: { values: {} },
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'values',
						displayName: 'Truth Value Parameters',
						values: [
							{
								displayName: 'Strength',
								name: 'strength',
								type: 'number',
								default: 0.8,
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'The strength (confidence) of the truth value',
							},
							{
								displayName: 'Confidence',
								name: 'confidence',
								type: 'number',
								default: 0.9,
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'The confidence in the truth value',
							},
						],
					},
				],
			},
			// Pattern matching fields
			{
				displayName: 'Pattern',
				name: 'pattern',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['patternMatch'],
					},
				},
				default: '',
				description: 'The pattern to match in OpenCog Scheme syntax',
				placeholder: '(InheritanceLink (VariableNode "$X") (ConceptNode "Animal"))',
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['queryAtoms', 'patternMatch'],
					},
				},
				default: 100,
				description: 'Maximum number of results to return',
			},
		],
	};

	private client: OpenCogClient | null = null;

	/**
	 * Initialize OpenCog client with credentials or simulation mode
	 */
	private async getClient(context: IExecuteFunctions): Promise<OpenCogClient> {
		if (this.client) {
			return this.client;
		}

		const useCredentials = context.getNodeParameter('useCredentials', 0, false) as boolean;

		let credentials: OpenCogCredentials = {
			serverUrl: '',
			useSimulation: true,
		};

		if (useCredentials) {
			try {
				const creds = await context.getCredentials('openCogApi');
				credentials = {
					serverUrl: creds.serverUrl as string,
					apiKey: creds.apiKey as string,
					username: creds.username as string,
					password: creds.password as string,
					timeout: creds.timeout as number,
					useSimulation: creds.useSimulation as boolean,
				};
			} catch {
				// Credentials not available, use simulation mode
				credentials.useSimulation = true;
			}
		}

		this.client = new OpenCogClient(credentials);
		await this.client.connect();
		return this.client;
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const node = new AtomSpace();

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			let result: Record<string, unknown>;

			try {
				const client = await node.getClient(this);
				const isSimulation = client.isSimulationMode();

				switch (operation) {
					case 'addAtom':
						result = await node.addAtom(this, i, client);
						break;
					case 'queryAtoms':
						result = await node.queryAtoms(this, i, client);
						break;
					case 'patternMatch':
						result = await node.patternMatch(this, i, client);
						break;
					case 'getTruthValue':
						result = await node.getTruthValue(this, i, client);
						break;
					case 'setTruthValue':
						result = await node.setTruthValue(this, i, client);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				// Add metadata about connection mode
				result.simulationMode = isSimulation;
				result.serverConnected = client.isConnected();

				returnData.push({
					json: result as IDataObject,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	private async addAtom(
		context: IExecuteFunctions,
		itemIndex: number,
		client: OpenCogClient,
	): Promise<Record<string, unknown>> {
		const atomType = context.getNodeParameter('atomType', itemIndex) as string;
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const truthValueParam = context.getNodeParameter('truthValue', itemIndex) as {
			values?: { strength: number; confidence: number };
		};

		const truthValue = truthValueParam?.values || { strength: 0.8, confidence: 0.9 };

		const atom = await client.addAtom(atomType, atomName, truthValue);

		return {
			operation: 'addAtom',
			atomId: atom.id,
			atomType: atom.type,
			atomName: atom.name,
			truthValue: atom.truthValue,
			timestamp: new Date().toISOString(),
			success: true,
		};
	}

	private async queryAtoms(
		context: IExecuteFunctions,
		itemIndex: number,
		client: OpenCogClient,
	): Promise<Record<string, unknown>> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const maxResults = context.getNodeParameter('maxResults', itemIndex) as number;

		const queryResult = await client.queryAtoms(atomName, undefined, maxResults);

		return {
			operation: 'queryAtoms',
			query: atomName,
			results: queryResult.atoms.map((atom) => ({
				atomId: atom.id,
				atomType: atom.type,
				atomName: atom.name,
				truthValue: atom.truthValue,
			})),
			totalCount: queryResult.totalCount,
		};
	}

	private async patternMatch(
		context: IExecuteFunctions,
		itemIndex: number,
		client: OpenCogClient,
	): Promise<Record<string, unknown>> {
		const pattern = context.getNodeParameter('pattern', itemIndex) as string;
		const maxResults = context.getNodeParameter('maxResults', itemIndex) as number;

		const matchResult = await client.patternMatch(pattern, maxResults);

		return {
			operation: 'patternMatch',
			pattern,
			matches: matchResult.matches,
			matchCount: matchResult.matchCount,
		};
	}

	private async getTruthValue(
		context: IExecuteFunctions,
		itemIndex: number,
		client: OpenCogClient,
	): Promise<Record<string, unknown>> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;

		const truthValue = await client.getTruthValue(atomName);

		return {
			operation: 'getTruthValue',
			atomName,
			truthValue: truthValue || { strength: 0, confidence: 0 },
			exists: truthValue !== null,
		};
	}

	private async setTruthValue(
		context: IExecuteFunctions,
		itemIndex: number,
		client: OpenCogClient,
	): Promise<Record<string, unknown>> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const truthValueParam = context.getNodeParameter('truthValue', itemIndex) as {
			values?: { strength: number; confidence: number };
		};

		const newTruthValue = truthValueParam?.values || { strength: 0.8, confidence: 0.9 };

		// Get old truth value first
		const oldTruthValue = await client.getTruthValue(atomName);

		// Set new truth value
		await client.setTruthValue(atomName, newTruthValue);

		return {
			operation: 'setTruthValue',
			atomName,
			oldTruthValue: oldTruthValue || { strength: 0, confidence: 0 },
			newTruthValue,
			success: true,
		};
	}
}
