import type { INodeTypes } from 'n8n-workflow';
import { NodeHelpers } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import { PatternMiner } from '../PatternMiner.node';

describe('PatternMiner Node', () => {
	let patternMiner: PatternMiner;
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		patternMiner = new PatternMiner();
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn(),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;
	});

	// Helper function to create merged context for execute
	const createContext = () => {
		const context = Object.create(patternMiner);
		Object.assign(context, mockExecuteFunctions);
		return context;
	};

	describe('Node Properties', () => {
		test('should have correct node properties', () => {
			expect(patternMiner.description.name).toBe('patternMiner');
			expect(patternMiner.description.displayName).toBe('OpenCog Pattern Miner');
			expect(patternMiner.description.group).toContain('transform');
		});

		test('should have correct mining types', () => {
			const miningTypeProperty = patternMiner.description.properties.find(p => p.name === 'miningType');
			expect(miningTypeProperty).toBeDefined();
			expect(miningTypeProperty?.type).toBe('options');
			
			const miningOptions = miningTypeProperty?.options as Array<{ value: string }>;
			const miningValues = miningOptions.map(op => op.value);
			
			expect(miningValues).toContain('frequentPatterns');
			expect(miningValues).toContain('associationRules');
			expect(miningValues).toContain('sequentialPatterns');
			expect(miningValues).toContain('causalPatterns');
			expect(miningValues).toContain('anomalyDetection');
			expect(miningValues).toContain('conceptFormation');
		});
	});

	describe('Frequent Patterns Mining', () => {
		test('should mine frequent patterns successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('frequentPatterns') // miningType
				.mockReturnValueOnce('item1, item2, item3, item4') // inputData
				.mockReturnValueOnce({ values: { minSupport: 0.3, maxPatternLength: 5 } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('frequentPatterns');
			expect(output.patterns).toBeDefined();
			expect(Array.isArray(output.patterns)).toBe(true);
			expect(output.totalPatterns).toBeGreaterThan(0);
		});

		test('should return patterns sorted by support', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('frequentPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { minSupport: 0.2, maxPatternLength: 3 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.patterns.length).toBeGreaterThan(1);
			
			// Verify patterns are sorted by support (descending)
			for (let i = 0; i < output.patterns.length - 1; i++) {
				expect(output.patterns[i].support).toBeGreaterThanOrEqual(output.patterns[i + 1].support);
			}
		});

		test('should respect minimum support threshold', async () => {
			const minSupport = 0.5;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('frequentPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { minSupport, maxPatternLength: 4 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			output.patterns.forEach((pattern: any) => {
				expect(pattern.support).toBeGreaterThanOrEqual(minSupport);
			});
		});
	});

	describe('Association Rules Discovery', () => {
		test('should discover association rules successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('associationRules') // miningType
				.mockReturnValueOnce('transaction data') // inputData
				.mockReturnValueOnce({ values: { minSupport: 0.3, minConfidence: 0.6 } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('associationRules');
			expect(output.rules).toBeDefined();
			expect(Array.isArray(output.rules)).toBe(true);
			expect(output.totalRules).toBeGreaterThan(0);
		});

		test('should include rule metrics', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('associationRules')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { minSupport: 0.2, minConfidence: 0.5 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.rules.length).toBeGreaterThan(0);
			
			output.rules.forEach((rule: any) => {
				expect(rule).toHaveProperty('antecedent');
				expect(rule).toHaveProperty('consequent');
				expect(rule).toHaveProperty('support');
				expect(rule).toHaveProperty('confidence');
				expect(rule).toHaveProperty('lift');
				expect(rule).toHaveProperty('conviction');
				expect(rule).toHaveProperty('interestingness');
			});
		});

		test('should filter strong rules by confidence', async () => {
			const minConfidence = 0.7;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('associationRules')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { minSupport: 0.3, minConfidence } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.strongRules).toBeDefined();
			expect(typeof output.strongRules).toBe('number');
			expect(output.strongRules).toBeLessThanOrEqual(output.totalRules);
		});
	});

	describe('Sequential Patterns Mining', () => {
		test('should find sequential patterns successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('sequentialPatterns') // miningType
				.mockReturnValueOnce('temporal data') // inputData
				.mockReturnValueOnce({ values: { windowSize: 10 } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('sequentialPatterns');
			expect(output.sequences).toBeDefined();
			expect(Array.isArray(output.sequences)).toBe(true);
			expect(output.totalSequences).toBeGreaterThan(0);
		});

		test('should include temporal insights', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('sequentialPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { windowSize: 8 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.temporalInsights).toBeDefined();
			expect(output.temporalInsights.avgSequenceLength).toBeGreaterThan(0);
			expect(output.temporalInsights.mostCommonEvent).toBeDefined();
		});

		test('should respect window size configuration', async () => {
			const windowSize = 5;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('sequentialPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { windowSize } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.config.windowSize).toBe(windowSize);
			
			output.sequences.forEach((seq: any) => {
				expect(seq.events.length).toBeLessThanOrEqual(windowSize + 1);
			});
		});
	});

	describe('Causal Patterns Identification', () => {
		test('should identify causal patterns successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('causalPatterns') // miningType
				.mockReturnValueOnce('causal data') // inputData
				.mockReturnValueOnce({ values: { windowSize: 10 } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('causalPatterns');
			expect(output.causalRelations).toBeDefined();
			expect(Array.isArray(output.causalRelations)).toBe(true);
		});

		test('should include causal network structure', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('causalPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { windowSize: 12 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.causalNetwork).toBeDefined();
			expect(output.causalNetwork.nodes).toBeDefined();
			expect(output.causalNetwork.edges).toBeDefined();
			expect(Array.isArray(output.causalNetwork.nodes)).toBe(true);
			expect(Array.isArray(output.causalNetwork.edges)).toBe(true);
		});

		test('should provide causal insights', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('causalPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { windowSize: 10 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.insights).toBeDefined();
			expect(output.insights.strongestCause).toBeDefined();
			expect(output.insights.mostCommonEffect).toBeDefined();
		});
	});

	describe('Anomaly Detection', () => {
		test('should detect anomalies successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('anomalyDetection') // miningType
				.mockReturnValueOnce('data with anomalies') // inputData
				.mockReturnValueOnce({ values: { anomalyThreshold: 0.9 } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('anomalyDetection');
			expect(output.anomalies).toBeDefined();
			expect(Array.isArray(output.anomalies)).toBe(true);
		});

		test('should respect anomaly threshold', async () => {
			const anomalyThreshold = 0.85;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('anomalyDetection')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { anomalyThreshold } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			output.anomalies.forEach((anomaly: any) => {
				expect(anomaly.anomalyScore).toBeGreaterThanOrEqual(anomalyThreshold);
			});
		});

		test('should classify anomaly types', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('anomalyDetection')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { anomalyThreshold: 0.8 } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			const validTypes = ['outlier', 'novelty', 'drift'];
			output.anomalies.forEach((anomaly: any) => {
				expect(validTypes).toContain(anomaly.anomalyType);
			});
		});
	});

	describe('Concept Formation', () => {
		test('should form concepts successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('conceptFormation') // miningType
				.mockReturnValueOnce('clusterable data') // inputData
				.mockReturnValueOnce({ values: { numClusters: 3, clusteringMethod: 'kmeans' } }); // patternConfig

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.miningType).toBe('conceptFormation');
			expect(output.concepts).toBeDefined();
			expect(Array.isArray(output.concepts)).toBe(true);
		});

		test('should support different clustering methods', async () => {
			const methods = ['kmeans', 'hierarchical', 'dbscan'];
			
			for (const method of methods) {
				mockExecuteFunctions.getNodeParameter = jest.fn()
					.mockReturnValueOnce('conceptFormation')
					.mockReturnValueOnce('test data')
					.mockReturnValueOnce({ values: { numClusters: 4, clusteringMethod: method } });

				const result = await patternMiner.execute.call(createContext());
				const output = result[0][0].json;
				
				expect(output.config.clusteringMethod).toBe(method);
			}
		});

		test('should provide clustering quality metrics', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('conceptFormation')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: { numClusters: 5, clusteringMethod: 'kmeans' } });

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output.qualityMetrics).toBeDefined();
			expect(output.qualityMetrics.silhouetteScore).toBeDefined();
			expect(output.qualityMetrics.avgIntraClusterDistance).toBeDefined();
			expect(output.qualityMetrics.avgInterClusterDistance).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		test('should handle unknown mining type', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('unknownMiningType');
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await patternMiner.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.error).toContain('Unknown mining type');
		});

		test('should continue on fail when configured', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('frequentPatterns') // operation
				.mockImplementation(() => {
					throw new Error('Test error');
				});
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await patternMiner.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0][0].json).toHaveProperty('error');
		});
	});

	describe('Configuration Validation', () => {
		test('should handle default configuration values', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('frequentPatterns')
				.mockReturnValueOnce('test data')
				.mockReturnValueOnce({ values: {} }); // Empty config

			const result = await patternMiner.execute.call(createContext());
			const output = result[0][0].json;
			
			expect(output).toBeDefined();
			expect(output.patterns).toBeDefined();
		});
	});
});
