import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

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
		properties: [
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
						name: 'Query Atoms',
						value: 'queryAtoms',
						description: 'Query atoms from the AtomSpace',
						action: 'Query atoms from the AtomSpace',
					},
					{
						name: 'Pattern Match',
						value: 'patternMatch',
						description: 'Perform pattern matching in the AtomSpace',
						action: 'Perform pattern matching',
					},
					{
						name: 'Get Truth Value',
						value: 'getTruthValue',
						description: 'Get the truth value of an atom',
						action: 'Get truth value of an atom',
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
						name: 'PredicateNode',
						value: 'PredicateNode',
						description: 'Represents a predicate or relation',
					},
					{
						name: 'LinkNode',
						value: 'LinkNode',
						description: 'Represents a link between atoms',
					},
					{
						name: 'InheritanceLink',
						value: 'InheritanceLink',
						description: 'Represents inheritance relationship',
					},
					{
						name: 'SimilarityLink',
						value: 'SimilarityLink',
						description: 'Represents similarity relationship',
					},
					{
						name: 'EvaluationLink',
						value: 'EvaluationLink',
						description: 'Represents evaluation of a predicate',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;

			let result: any;

			try {
				switch (operation) {
					case 'addAtom':
						result = await (this as any).addAtom(this, i);
						break;
					case 'queryAtoms':
						result = await (this as any).queryAtoms(this, i);
						break;
					case 'patternMatch':
						result = await (this as any).patternMatch(this, i);
						break;
					case 'getTruthValue':
						result = await (this as any).getTruthValue(this, i);
						break;
					case 'setTruthValue':
						result = await (this as any).setTruthValue(this, i);
						break;
					default:
						throw new Error(`Unknown operation: ${operation}`);
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async addAtom(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const atomType = context.getNodeParameter('atomType', itemIndex) as string;
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const truthValueParam = context.getNodeParameter('truthValue', itemIndex) as any;
		
		const truthValue = truthValueParam?.values || { strength: 0.8, confidence: 0.9 };

		// Simulate AtomSpace operation
		const atomId = `atom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		return {
			operation: 'addAtom',
			atomId,
			atomType,
			atomName,
			truthValue,
			timestamp: new Date().toISOString(),
			success: true,
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async queryAtoms(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const maxResults = context.getNodeParameter('maxResults', itemIndex) as number;

		// Simulate query operation
		const results = [];
		const numResults = Math.min(maxResults, Math.floor(Math.random() * 10) + 1);
		
		for (let i = 0; i < numResults; i++) {
			results.push({
				atomId: `atom_${i}_${atomName}`,
				atomType: 'ConceptNode',
				atomName: `${atomName}_${i}`,
				truthValue: {
					strength: Math.random(),
					confidence: Math.random(),
				},
			});
		}

		return {
			operation: 'queryAtoms',
			query: atomName,
			results,
			totalCount: results.length,
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async patternMatch(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const pattern = context.getNodeParameter('pattern', itemIndex) as string;
		const maxResults = context.getNodeParameter('maxResults', itemIndex) as number;

		// Simulate pattern matching
		const matches = [];
		const numMatches = Math.min(maxResults, Math.floor(Math.random() * 5) + 1);

		for (let i = 0; i < numMatches; i++) {
			matches.push({
				matchId: `match_${i}`,
				bindings: {
					'$X': `Entity_${i}`,
					'$Y': `Property_${i}`,
				},
				truthValue: {
					strength: Math.random(),
					confidence: Math.random(),
				},
			});
		}

		return {
			operation: 'patternMatch',
			pattern,
			matches,
			matchCount: matches.length,
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async getTruthValue(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;

		// Simulate getting truth value
		return {
			operation: 'getTruthValue',
			atomName,
			truthValue: {
				strength: Math.random(),
				confidence: Math.random(),
			},
			exists: true,
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async setTruthValue(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const atomName = context.getNodeParameter('atomName', itemIndex) as string;
		const truthValueParam = context.getNodeParameter('truthValue', itemIndex) as any;
		
		const truthValue = truthValueParam?.values || { strength: 0.8, confidence: 0.9 };

		return {
			operation: 'setTruthValue',
			atomName,
			oldTruthValue: {
				strength: Math.random(),
				confidence: Math.random(),
			},
			newTruthValue: truthValue,
			success: true,
		};
	}
}