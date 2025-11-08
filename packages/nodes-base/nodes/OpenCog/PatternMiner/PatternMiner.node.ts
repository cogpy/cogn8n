import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class PatternMiner implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCog Pattern Miner',
		name: 'patternMiner',
		icon: 'file:pattern.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["miningType"] }}',
		description: 'Cognitive pattern mining and recognition for knowledge discovery',
		defaults: {
			name: 'Pattern Miner',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Mining Type',
				name: 'miningType',
				type: 'options',
				noDataExpression: true,
				default: 'frequentPatterns',
				options: [
					{
						name: 'Frequent Patterns',
						value: 'frequentPatterns',
						description: 'Mine frequently occurring patterns',
						action: 'Mine frequent patterns',
					},
					{
						name: 'Association Rules',
						value: 'associationRules',
						description: 'Discover association rules between concepts',
						action: 'Discover association rules',
					},
					{
						name: 'Sequential Patterns',
						value: 'sequentialPatterns',
						description: 'Find patterns in sequences and temporal data',
						action: 'Find sequential patterns',
					},
					{
						name: 'Causal Patterns',
						value: 'causalPatterns',
						description: 'Identify causal relationships and patterns',
						action: 'Identify causal patterns',
					},
					{
						name: 'Anomaly Detection',
						value: 'anomalyDetection',
						description: 'Detect anomalous patterns and outliers',
						action: 'Detect anomalous patterns',
					},
					{
						name: 'Concept Formation',
						value: 'conceptFormation',
						description: 'Form new concepts from pattern clusters',
						action: 'Form new concepts',
					},
				],
			},
			{
				displayName: 'Input Data',
				name: 'inputData',
				type: 'string',
				default: '',
				description: 'Input data for pattern mining (JSON, CSV, or text)',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Pattern Configuration',
				name: 'patternConfig',
				type: 'fixedCollection',
				default: { values: {} },
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'values',
						displayName: 'Configuration',
						values: [
							{
								displayName: 'Minimum Support',
								name: 'minSupport',
								type: 'number',
								default: 0.3,
								displayOptions: {
									show: {
										'/miningType': ['frequentPatterns', 'associationRules'],
									},
								},
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'Minimum support threshold for frequent patterns',
							},
							{
								displayName: 'Minimum Confidence',
								name: 'minConfidence',
								type: 'number',
								default: 0.7,
								displayOptions: {
									show: {
										'/miningType': ['associationRules'],
									},
								},
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'Minimum confidence threshold for association rules',
							},
							{
								displayName: 'Window Size',
								name: 'windowSize',
								type: 'number',
								default: 5,
								displayOptions: {
									show: {
										'/miningType': ['sequentialPatterns', 'causalPatterns'],
									},
								},
								description: 'Size of the sliding window for pattern detection',
							},
							{
								displayName: 'Max Pattern Length',
								name: 'maxPatternLength',
								type: 'number',
								default: 10,
								description: 'Maximum length of patterns to discover',
							},
							{
								displayName: 'Anomaly Threshold',
								name: 'anomalyThreshold',
								type: 'number',
								default: 0.95,
								displayOptions: {
									show: {
										'/miningType': ['anomalyDetection'],
									},
								},
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'Threshold for anomaly detection (percentile)',
							},
							{
								displayName: 'Clustering Method',
								name: 'clusteringMethod',
								type: 'options',
								default: 'hierarchical',
								displayOptions: {
									show: {
										'/miningType': ['conceptFormation'],
									},
								},
								options: [
									{
										name: 'Hierarchical',
										value: 'hierarchical',
									},
									{
										name: 'K-Means',
										value: 'kmeans',
									},
									{
										name: 'DBSCAN',
										value: 'dbscan',
									},
								],
								description: 'Method for clustering patterns into concepts',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const miningType = this.getNodeParameter('miningType', i) as string;

			let result: any;

			try {
				switch (miningType) {
					case 'frequentPatterns':
						result = await (this as any).mineFrequentPatterns(this, i);
						break;
					case 'associationRules':
						result = await (this as any).discoverAssociationRules(this, i);
						break;
					case 'sequentialPatterns':
						result = await (this as any).findSequentialPatterns(this, i);
						break;
					case 'causalPatterns':
						result = await (this as any).identifyCausalPatterns(this, i);
						break;
					case 'anomalyDetection':
						result = await (this as any).detectAnomalies(this, i);
						break;
					case 'conceptFormation':
						result = await (this as any).formConcepts(this, i);
						break;
					default:
						throw new Error(`Unknown mining type: ${miningType}`);
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
	private async mineFrequentPatterns(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate frequent pattern mining
		const patterns = [];
		const numPatterns = Math.floor(Math.random() * 10) + 5;

		for (let i = 0; i < numPatterns; i++) {
			const patternLength = Math.floor(Math.random() * config.maxPatternLength) + 1;
			const pattern = [];
			
			for (let j = 0; j < patternLength; j++) {
				pattern.push(`item_${Math.floor(Math.random() * 20)}`);
			}

			const support = Math.max(config.minSupport, Math.random());
			
			patterns.push({
				patternId: `pattern_${i}`,
				items: pattern,
				support,
				frequency: Math.floor(support * 1000), // Simulated frequency count
				length: patternLength,
			});
		}

		// Sort by support (descending)
		patterns.sort((a, b) => b.support - a.support);

		return {
			miningType: 'frequentPatterns',
			inputSize: inputData.length,
			config: { minSupport: config.minSupport },
			patterns,
			totalPatterns: patterns.length,
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async discoverAssociationRules(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate association rule discovery
		const rules = [];
		const numRules = Math.floor(Math.random() * 8) + 3;

		for (let i = 0; i < numRules; i++) {
			const antecedent = [`item_${Math.floor(Math.random() * 15)}`];
			const consequent = [`item_${Math.floor(Math.random() * 15) + 15}`];
			
			const support = Math.max(config.minSupport, Math.random());
			const confidence = Math.max(config.minConfidence, Math.random());
			const lift = Math.random() * 3; // Lift can be > 1

			rules.push({
				ruleId: `rule_${i}`,
				antecedent,
				consequent,
				support,
				confidence,
				lift,
				conviction: confidence / (1 - confidence), // Simplified conviction
				interestingness: support * confidence * lift,
			});
		}

		// Sort by interestingness
		rules.sort((a, b) => b.interestingness - a.interestingness);

		return {
			miningType: 'associationRules',
			inputSize: inputData.length,
			config: { minSupport: config.minSupport, minConfidence: config.minConfidence },
			rules,
			totalRules: rules.length,
			strongRules: rules.filter(r => r.confidence >= config.minConfidence).length,
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async findSequentialPatterns(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate sequential pattern mining
		const sequences = [];
		const numSequences = Math.floor(Math.random() * 6) + 2;

		for (let i = 0; i < numSequences; i++) {
			const sequenceLength = Math.floor(Math.random() * config.windowSize) + 2;
			const sequence = [];
			
			for (let j = 0; j < sequenceLength; j++) {
				sequence.push({
					event: `event_${Math.floor(Math.random() * 10)}`,
					timestamp: j, // Relative timestamp
				});
			}

			const support = Math.random();
			
			sequences.push({
				sequenceId: `seq_${i}`,
				events: sequence,
				support,
				avgGap: Math.random() * 10, // Average time gap between events
				confidence: Math.random(),
			});
		}

		// Sort by support
		sequences.sort((a, b) => b.support - a.support);

		return {
			miningType: 'sequentialPatterns',
			inputSize: inputData.length,
			config: { windowSize: config.windowSize },
			sequences,
			totalSequences: sequences.length,
			temporalInsights: {
				avgSequenceLength: sequences.reduce((acc, seq) => acc + seq.events.length, 0) / sequences.length,
				mostCommonEvent: 'event_5', // Simulated
			},
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async identifyCausalPatterns(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate causal pattern identification
		const causalRelations = [];
		const numRelations = Math.floor(Math.random() * 5) + 2;

		for (let i = 0; i < numRelations; i++) {
			const cause = `cause_${Math.floor(Math.random() * 10)}`;
			const effect = `effect_${Math.floor(Math.random() * 10)}`;
			
			causalRelations.push({
				relationId: `causal_${i}`,
				cause,
				effect,
				strength: Math.random(),
				confidence: Math.random(),
				timeDelay: Math.random() * config.windowSize,
				evidenceCount: Math.floor(Math.random() * 50) + 10,
				significance: Math.random(),
			});
		}

		// Sort by strength
		causalRelations.sort((a, b) => b.strength - a.strength);

		return {
			miningType: 'causalPatterns',
			inputSize: inputData.length,
			config: { windowSize: config.windowSize },
			causalRelations,
			causalNetwork: {
				nodes: [...new Set([...causalRelations.map(r => r.cause), ...causalRelations.map(r => r.effect)])],
				edges: causalRelations.map(r => ({ from: r.cause, to: r.effect, weight: r.strength })),
			},
			insights: {
				strongestCause: causalRelations[0]?.cause || 'none',
				mostCommonEffect: causalRelations[0]?.effect || 'none',
			},
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async detectAnomalies(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate anomaly detection
		const anomalies = [];
		const numAnomalies = Math.floor(Math.random() * 5) + 1;

		for (let i = 0; i < numAnomalies; i++) {
			anomalies.push({
				anomalyId: `anomaly_${i}`,
				data: `anomalous_data_${i}`,
				anomalyScore: Math.max(config.anomalyThreshold, Math.random()),
				anomalyType: ['outlier', 'novelty', 'drift'][Math.floor(Math.random() * 3)],
				deviation: Math.random() * 10,
				explanation: `Deviates significantly from normal pattern`,
				confidence: Math.random(),
			});
		}

		// Sort by anomaly score
		anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);

		const statistics = {
			totalDataPoints: Math.floor(Math.random() * 1000) + 100,
			normalPoints: Math.floor(Math.random() * 950) + 50,
			anomalousPoints: anomalies.length,
			anomalyRate: anomalies.length / 1000, // Simplified
		};

		return {
			miningType: 'anomalyDetection',
			inputSize: inputData.length,
			config: { anomalyThreshold: config.anomalyThreshold },
			anomalies,
			statistics,
			recommendations: [
				'Investigate highest scoring anomalies first',
				'Check for data quality issues',
				'Consider updating normal patterns',
			],
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async formConcepts(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const inputData = context.getNodeParameter('inputData', itemIndex) as string;
		const config = this.getPatternConfig(context, itemIndex);

		// Simulate concept formation
		const concepts = [];
		const numConcepts = Math.floor(Math.random() * 4) + 2;

		for (let i = 0; i < numConcepts; i++) {
			const clusterSize = Math.floor(Math.random() * 20) + 5;
			const patterns = [];
			
			for (let j = 0; j < clusterSize; j++) {
				patterns.push(`pattern_${i}_${j}`);
			}

			concepts.push({
				conceptId: `concept_${i}`,
				conceptName: `Concept_${String.fromCharCode(65 + i)}`, // A, B, C, etc.
				patterns,
				clusterSize,
				coherence: Math.random(),
				distinctiveness: Math.random(),
				generality: Math.random(),
				properties: [
					`property_${i}_1`,
					`property_${i}_2`,
				],
			});
		}

		// Sort by coherence
		concepts.sort((a, b) => b.coherence - a.coherence);

		const conceptHierarchy = this.buildConceptHierarchy(concepts);

		// Generate quality metrics
		const qualityMetrics = {
			silhouetteScore: Math.random() * 0.5 + 0.5, // Range: 0.5-1.0 (good clustering)
			avgIntraClusterDistance: Math.random() * 0.3, // Low is better
			avgInterClusterDistance: Math.random() * 0.5 + 0.5, // High is better
			daviesBouldinIndex: Math.random() * 2, // Low is better
		};

		return {
			miningType: 'conceptFormation',
			inputSize: inputData.length,
			config: { clusteringMethod: config.clusteringMethod },
			concepts,
			conceptHierarchy,
			qualityMetrics,
			insights: {
				totalConcepts: concepts.length,
				avgClusterSize: concepts.reduce((acc, c) => acc + c.clusterSize, 0) / concepts.length,
				mostCoherentConcept: concepts[0]?.conceptName || 'none',
			},
			timestamp: new Date().toISOString(),
		};
	}

	private buildConceptHierarchy(concepts: any[]): any {
		// Simulate a simple concept hierarchy
		return {
			root: 'General_Knowledge',
			levels: [
				{
					level: 1,
					concepts: concepts.slice(0, Math.ceil(concepts.length / 2)).map(c => c.conceptName),
				},
				{
					level: 2,
					concepts: concepts.slice(Math.ceil(concepts.length / 2)).map(c => c.conceptName),
				},
			],
			relationships: concepts.map((c, i) => ({
				parent: i === 0 ? 'General_Knowledge' : concepts[0].conceptName,
				child: c.conceptName,
				strength: Math.random(),
			})),
		};
	}

	private getPatternConfig(context: IExecuteFunctions, itemIndex: number): any {
		const configCollection = context.getNodeParameter('patternConfig', itemIndex) as any;
		const config = configCollection?.values || {};
		
		return {
			minSupport: config.minSupport || 0.3,
			minConfidence: config.minConfidence || 0.7,
			windowSize: config.windowSize || 5,
			maxPatternLength: config.maxPatternLength || 10,
			anomalyThreshold: config.anomalyThreshold || 0.95,
			clusteringMethod: config.clusteringMethod || 'hierarchical',
		};
	}
}