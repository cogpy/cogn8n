import type { INodeTypes } from 'n8n-workflow';
import { NodeHelpers } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import { ReasoningEngine } from '../ReasoningEngine.node';

describe('ReasoningEngine Node', () => {
	let reasoningEngine: ReasoningEngine;
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		reasoningEngine = new ReasoningEngine();
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn(),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;
	});

	describe('Node Properties', () => {
		test('should have correct node properties', () => {
			expect(reasoningEngine.description.name).toBe('reasoningEngine');
			expect(reasoningEngine.description.displayName).toBe('OpenCog Reasoning Engine');
			expect(reasoningEngine.description.group).toContain('transform');
		});

		test('should have correct reasoning types', () => {
			const reasoningTypeProperty = reasoningEngine.description.properties.find(p => p.name === 'reasoningType');
			expect(reasoningTypeProperty).toBeDefined();
			expect(reasoningTypeProperty?.type).toBe('options');
			
			const reasoningOptions = reasoningTypeProperty?.options as Array<{ value: string }>;
			const reasoningValues = reasoningOptions.map(op => op.value);
			
			expect(reasoningValues).toContain('forwardChaining');
			expect(reasoningValues).toContain('backwardChaining');
			expect(reasoningValues).toContain('abductiveReasoning');
			expect(reasoningValues).toContain('analogicalReasoning');
			expect(reasoningValues).toContain('probabilisticReasoning');
			expect(reasoningValues).toContain('temporalReasoning');
		});
	});

	describe('Forward Chaining', () => {
		test('should perform forward chaining successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('forwardChaining') // reasoningType
				.mockReturnValueOnce('If A then B. A is true.') // inputKnowledge
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('forwardChaining');
			expect(output.steps).toBeDefined();
			expect(Array.isArray(output.steps)).toBe(true);
			expect(output.conclusions).toBeDefined();
			expect(Array.isArray(output.conclusions)).toBe(true);
		});

		test('should generate inference steps', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('forwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.steps.length).toBeGreaterThan(0);
			expect(output.totalSteps).toBe(output.steps.length);
			
			output.steps.forEach((step: any) => {
				expect(step).toHaveProperty('stepNumber');
				expect(step).toHaveProperty('rule');
				expect(step).toHaveProperty('premise');
				expect(step).toHaveProperty('conclusion');
				expect(step).toHaveProperty('confidence');
			});
		});

		test('should filter conclusions by confidence threshold', async () => {
			const confidenceThreshold = 0.8;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('forwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			output.conclusions.forEach((conclusion: any) => {
				expect(conclusion.confidence).toBeGreaterThanOrEqual(confidenceThreshold);
			});
		});
	});

	describe('Backward Chaining', () => {
		test('should perform backward chaining successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('backwardChaining') // reasoningType
				.mockReturnValueOnce('If A then B. If B then C.') // inputKnowledge
				.mockReturnValueOnce('Prove C') // goalQuery
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('backwardChaining');
			expect(output.goalQuery).toBe('Prove C');
			expect(output.subgoals).toBeDefined();
			expect(Array.isArray(output.subgoals)).toBe(true);
		});

		test('should generate proof steps', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('backwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('test goal')
				.mockReturnValueOnce({ values: { maxSteps: 4, confidenceThreshold: 0.5, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.proofSteps).toBeDefined();
			expect(Array.isArray(output.proofSteps)).toBe(true);
			
			output.proofSteps.forEach((step: any) => {
				expect(step).toHaveProperty('step');
				expect(step).toHaveProperty('goal');
				expect(step).toHaveProperty('proof');
				expect(step).toHaveProperty('confidence');
			});
		});

		test('should determine goal proof status', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('backwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('test goal')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output).toHaveProperty('goalProven');
			expect(typeof output.goalProven).toBe('boolean');
			expect(output).toHaveProperty('overallConfidence');
			expect(typeof output.overallConfidence).toBe('number');
		});
	});

	describe('Abductive Reasoning', () => {
		test('should perform abductive reasoning successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('abductiveReasoning') // reasoningType
				.mockReturnValueOnce('knowledge base') // inputKnowledge
				.mockReturnValueOnce('observed phenomenon') // goalQuery
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('abductiveReasoning');
			expect(output.hypotheses).toBeDefined();
			expect(Array.isArray(output.hypotheses)).toBe(true);
		});

		test('should generate explanatory hypotheses', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('abductiveReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('observation')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.hypotheses.length).toBeGreaterThan(0);
			
			output.hypotheses.forEach((hypothesis: any) => {
				expect(hypothesis).toHaveProperty('hypothesis');
				expect(hypothesis).toHaveProperty('plausibility');
				expect(hypothesis).toHaveProperty('explanation');
				expect(hypothesis).toHaveProperty('supportingEvidence');
			});
		});

		test('should rank hypotheses by plausibility', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('abductiveReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('observation')
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.5, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			// Verify hypotheses are sorted by plausibility (descending)
			for (let i = 0; i < output.hypotheses.length - 1; i++) {
				expect(output.hypotheses[i].plausibility).toBeGreaterThanOrEqual(output.hypotheses[i + 1].plausibility);
			}
		});
	});

	describe('Analogical Reasoning', () => {
		test('should perform analogical reasoning successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('analogicalReasoning') // reasoningType
				.mockReturnValueOnce('knowledge base') // inputKnowledge
				.mockReturnValueOnce('source domain') // sourceDomain
				.mockReturnValueOnce('target domain') // targetDomain
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('analogicalReasoning');
			expect(output.analogies).toBeDefined();
			expect(Array.isArray(output.analogies)).toBe(true);
		});

		test('should identify analogical mappings', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('analogicalReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('source')
				.mockReturnValueOnce('target')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.analogies.length).toBeGreaterThan(0);
			
			output.analogies.forEach((analogy: any) => {
				expect(analogy).toHaveProperty('sourceElement');
				expect(analogy).toHaveProperty('targetElement');
				expect(analogy).toHaveProperty('similarity');
				expect(analogy).toHaveProperty('mapping');
			});
		});

		test('should provide structural similarity scores', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('analogicalReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce('source')
				.mockReturnValueOnce('target')
				.mockReturnValueOnce({ values: { maxSteps: 4, confidenceThreshold: 0.5, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output).toHaveProperty('structuralSimilarity');
			expect(typeof output.structuralSimilarity).toBe('number');
			expect(output.structuralSimilarity).toBeGreaterThanOrEqual(0);
			expect(output.structuralSimilarity).toBeLessThanOrEqual(1);
		});
	});

	describe('Probabilistic Reasoning', () => {
		test('should perform probabilistic reasoning successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('probabilisticReasoning') // reasoningType
				.mockReturnValueOnce('probabilistic knowledge') // inputKnowledge
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('probabilisticReasoning');
			expect(output.inferences).toBeDefined();
			expect(Array.isArray(output.inferences)).toBe(true);
		});

		test('should compute probability distributions', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('probabilisticReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.inferences.length).toBeGreaterThan(0);
			
			output.inferences.forEach((inference: any) => {
				expect(inference).toHaveProperty('statement');
				expect(inference).toHaveProperty('probability');
				expect(inference.probability).toBeGreaterThanOrEqual(0);
				expect(inference.probability).toBeLessThanOrEqual(1);
			});
		});

		test('should handle uncertainty propagation', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('probabilisticReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 4, confidenceThreshold: 0.5, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output).toHaveProperty('uncertaintyMetrics');
			expect(output.uncertaintyMetrics).toHaveProperty('totalUncertainty');
			expect(output.uncertaintyMetrics).toHaveProperty('avgConfidence');
		});
	});

	describe('Temporal Reasoning', () => {
		test('should perform temporal reasoning successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('temporalReasoning') // reasoningType
				.mockReturnValueOnce('temporal knowledge') // inputKnowledge
				.mockReturnValueOnce({ values: { maxSteps: 5, confidenceThreshold: 0.7, useUncertainty: true } }); // reasoningParams

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.reasoningType).toBe('temporalReasoning');
			expect(output.temporalRelations).toBeDefined();
			expect(Array.isArray(output.temporalRelations)).toBe(true);
		});

		test('should identify temporal relationships', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('temporalReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 3, confidenceThreshold: 0.6, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.temporalRelations.length).toBeGreaterThan(0);
			
			const validRelations = ['before', 'after', 'during', 'overlaps', 'meets', 'starts', 'finishes'];
			output.temporalRelations.forEach((relation: any) => {
				expect(relation).toHaveProperty('event1');
				expect(relation).toHaveProperty('event2');
				expect(relation).toHaveProperty('relation');
				expect(validRelations).toContain(relation.relation);
			});
		});

		test('should provide temporal consistency analysis', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('temporalReasoning')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps: 4, confidenceThreshold: 0.5, useUncertainty: true } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output).toHaveProperty('consistencyCheck');
			expect(output.consistencyCheck).toHaveProperty('isConsistent');
			expect(typeof output.consistencyCheck.isConsistent).toBe('boolean');
		});
	});

	describe('Error Handling', () => {
		test('should handle unknown reasoning type', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('unknownReasoningType');
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			const output = result[0][0].json;
			expect(output.error).toContain('Unknown reasoning type');
		});

		test('should continue on fail when configured', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockImplementation(() => {
					throw new Error('Test error');
				});
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			
			expect(result).toHaveLength(1);
			expect(result[0][0].json).toHaveProperty('error');
		});
	});

	describe('Configuration Validation', () => {
		test('should handle default configuration values', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('forwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: {} }); // Empty config

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output).toBeDefined();
			expect(output.steps).toBeDefined();
		});

		test('should respect max steps limit', async () => {
			const maxSteps = 2;
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('forwardChaining')
				.mockReturnValueOnce('test knowledge')
				.mockReturnValueOnce({ values: { maxSteps, confidenceThreshold: 0.5, useUncertainty: false } });

			const result = await reasoningEngine.execute.call(mockExecuteFunctions);
			const output = result[0][0].json;
			
			expect(output.steps.length).toBeLessThanOrEqual(maxSteps);
		});
	});
});
