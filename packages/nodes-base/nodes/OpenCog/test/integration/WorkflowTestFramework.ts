/**
 * Integration test framework for OpenCog cognitive workflows
 * Tests complete workflows with multiple nodes working together
 */

import type { INodeExecutionData } from 'n8n-workflow';

export interface WorkflowTestCase {
	name: string;
	description: string;
	nodes: Array<{
		name: string;
		type: string;
		parameters: Record<string, any>;
	}>;
	inputData: INodeExecutionData[];
	expectedOutput: {
		itemCount?: number;
		outputStructure?: Record<string, any>;
		assertions?: Array<(output: INodeExecutionData[]) => boolean>;
	};
}

export interface TestResult {
	testCase: string;
	passed: boolean;
	executionTime: number;
	error?: string;
	output?: any;
}

/**
 * Workflow test runner for integration testing
 */
export class WorkflowTestRunner {
	private results: TestResult[] = [];

	/**
	 * Run a complete workflow test
	 */
	async runTest(testCase: WorkflowTestCase): Promise<TestResult> {
		const startTime = performance.now();

		try {
			// Simulate workflow execution
			let currentData = testCase.inputData;

			for (const node of testCase.nodes) {
				// Mock node execution
				const nodeOutput = await this.executeNode(node, currentData);
				currentData = nodeOutput;
			}

			// Validate output
			const validationResult = this.validateOutput(currentData, testCase.expectedOutput);

			const executionTime = performance.now() - startTime;

			const result: TestResult = {
				testCase: testCase.name,
				passed: validationResult.passed,
				executionTime,
				error: validationResult.error,
				output: currentData,
			};

			this.results.push(result);
			return result;
		} catch (error) {
			const executionTime = performance.now() - startTime;
			const result: TestResult = {
				testCase: testCase.name,
				passed: false,
				executionTime,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			return result;
		}
	}

	/**
	 * Run multiple test cases
	 */
	async runTests(testCases: WorkflowTestCase[]): Promise<TestResult[]> {
		const results: TestResult[] = [];

		for (const testCase of testCases) {
			const result = await this.runTest(testCase);
			results.push(result);
		}

		return results;
	}

	/**
	 * Generate test report
	 */
	generateReport(): string {
		const totalTests = this.results.length;
		const passedTests = this.results.filter((r) => r.passed).length;
		const failedTests = totalTests - passedTests;
		const avgExecutionTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;

		let report = '# OpenCog Workflow Integration Test Report\n\n';
		report += `Generated: ${new Date().toISOString()}\n\n`;
		report += '## Summary\n\n';
		report += `- Total Tests: ${totalTests}\n`;
		report += `- Passed: ${passedTests} ✓\n`;
		report += `- Failed: ${failedTests} ✗\n`;
		report += `- Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`;
		report += `- Average Execution Time: ${avgExecutionTime.toFixed(2)}ms\n\n`;

		report += '## Test Results\n\n';

		this.results.forEach((result) => {
			const status = result.passed ? '✓ PASS' : '✗ FAIL';
			report += `### ${status} - ${result.testCase}\n\n`;
			report += `- Execution Time: ${result.executionTime.toFixed(2)}ms\n`;

			if (result.error) {
				report += `- Error: ${result.error}\n`;
			}

			report += '\n';
		});

		return report;
	}

	/**
	 * Get all test results
	 */
	getResults(): TestResult[] {
		return [...this.results];
	}

	/**
	 * Clear test results
	 */
	clear(): void {
		this.results = [];
	}

	/**
	 * Mock node execution (to be replaced with actual execution in real tests)
	 */
	private async executeNode(
		node: { name: string; type: string; parameters: Record<string, any> },
		inputData: INodeExecutionData[],
	): Promise<INodeExecutionData[]> {
		// This is a mock implementation
		// In real tests, this would call the actual node execution logic

		// For now, just pass through the data
		return inputData.map((item) => ({
			json: {
				...item.json,
				processedBy: node.name,
				nodeType: node.type,
			},
		}));
	}

	/**
	 * Validate output against expected results
	 */
	private validateOutput(
		output: INodeExecutionData[],
		expected: WorkflowTestCase['expectedOutput'],
	): { passed: boolean; error?: string } {
		// Check item count
		if (expected.itemCount !== undefined && output.length !== expected.itemCount) {
			return {
				passed: false,
				error: `Expected ${expected.itemCount} items, got ${output.length}`,
			};
		}

		// Check output structure
		if (expected.outputStructure) {
			for (const key of Object.keys(expected.outputStructure)) {
				if (output.length > 0 && !(key in output[0].json)) {
					return {
						passed: false,
						error: `Expected key "${key}" not found in output`,
					};
				}
			}
		}

		// Run custom assertions
		if (expected.assertions) {
			for (const assertion of expected.assertions) {
				try {
					if (!assertion(output)) {
						return {
							passed: false,
							error: 'Custom assertion failed',
						};
					}
				} catch (error) {
					return {
						passed: false,
						error: `Assertion error: ${error instanceof Error ? error.message : String(error)}`,
					};
				}
			}
		}

		return { passed: true };
	}
}

/**
 * Pre-defined test cases for common cognitive workflows
 */
export const STANDARD_TEST_CASES: WorkflowTestCase[] = [
	{
		name: 'Basic Knowledge Processing',
		description: 'Test AtomSpace → Pattern Mining → Reasoning workflow',
		nodes: [
			{
				name: 'AtomSpace Input',
				type: 'n8n-nodes-base.atomSpace',
				parameters: {
					operation: 'addAtom',
					atomType: 'ConceptNode',
					atomName: 'TestConcept',
				},
			},
			{
				name: 'Pattern Mining',
				type: 'n8n-nodes-base.patternMiner',
				parameters: {
					miningType: 'frequentPatterns',
					inputData: 'test data',
				},
			},
			{
				name: 'Reasoning',
				type: 'n8n-nodes-base.reasoningEngine',
				parameters: {
					reasoningType: 'forwardChaining',
					inputKnowledge: 'test knowledge',
				},
			},
		],
		inputData: [{ json: { test: 'data' } }],
		expectedOutput: {
			itemCount: 1,
			assertions: [
				(output) => output[0]?.json !== undefined,
				(output) => output[0]?.json.processedBy !== undefined,
			],
		},
	},
	{
		name: 'Multi-Agent Collaboration',
		description: 'Test multiple cognitive agents working together',
		nodes: [
			{
				name: 'Goal Agent',
				type: 'n8n-nodes-base.cognitiveAgent',
				parameters: {
					agentType: 'goalOriented',
					agentName: 'GoalAgent',
				},
			},
			{
				name: 'Learning Agent',
				type: 'n8n-nodes-base.cognitiveAgent',
				parameters: {
					agentType: 'learning',
					agentName: 'LearningAgent',
				},
			},
			{
				name: 'Social Agent',
				type: 'n8n-nodes-base.cognitiveAgent',
				parameters: {
					agentType: 'social',
					agentName: 'SocialAgent',
				},
			},
		],
		inputData: [{ json: { task: 'collaborative problem solving' } }],
		expectedOutput: {
			itemCount: 1,
			assertions: [(output) => output.length > 0],
		},
	},
	{
		name: 'Complete Cognitive Pipeline',
		description: 'Test full pipeline: AtomSpace → PatternMiner → Reasoning → Agent',
		nodes: [
			{
				name: 'Knowledge Base',
				type: 'n8n-nodes-base.atomSpace',
				parameters: {
					operation: 'addAtom',
					atomType: 'ConceptNode',
				},
			},
			{
				name: 'Discover Patterns',
				type: 'n8n-nodes-base.patternMiner',
				parameters: {
					miningType: 'associationRules',
				},
			},
			{
				name: 'Apply Reasoning',
				type: 'n8n-nodes-base.reasoningEngine',
				parameters: {
					reasoningType: 'abductive',
				},
			},
			{
				name: 'Cognitive Agent',
				type: 'n8n-nodes-base.cognitiveAgent',
				parameters: {
					agentType: 'general',
				},
			},
		],
		inputData: [{ json: { data: 'test input' } }],
		expectedOutput: {
			itemCount: 1,
		},
	},
];

/**
 * Helper to create custom test cases
 */
export function createTestCase(
	name: string,
	description: string,
	nodes: WorkflowTestCase['nodes'],
	inputData: INodeExecutionData[],
	expectedOutput: WorkflowTestCase['expectedOutput'],
): WorkflowTestCase {
	return {
		name,
		description,
		nodes,
		inputData,
		expectedOutput,
	};
}

/**
 * Example usage:
 *
 * const runner = new WorkflowTestRunner();
 *
 * // Run standard tests
 * const results = await runner.runTests(STANDARD_TEST_CASES);
 * console.log(runner.generateReport());
 *
 * // Run custom test
 * const customTest = createTestCase(
 *   'My Custom Test',
 *   'Tests custom workflow',
 *   [...nodes],
 *   [...inputData],
 *   { itemCount: 1 }
 * );
 * const result = await runner.runTest(customTest);
 */
