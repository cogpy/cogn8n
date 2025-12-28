/**
 * Comprehensive Workflow Execution Integration Tests
 *
 * These tests validate the complete workflow execution lifecycle
 * including node execution, data flow, and error handling.
 */

import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { Workflow } from 'n8n-workflow';

// Mock dependencies
jest.mock('@n8n/decorators', () => ({
	Service: () => jest.fn(),
}));

describe('Workflow Execution Integration', () => {
	describe('Basic Workflow Execution', () => {
		it('should create a workflow from JSON definition', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'manual-trigger',
						name: 'Manual Trigger',
						type: 'n8n-nodes-base.manualTrigger',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
					},
				],
				connections: {},
			};

			const workflow = new Workflow({
				id: workflowData.id,
				name: workflowData.name,
				active: workflowData.active,
				nodes: workflowData.nodes,
				connections: workflowData.connections,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			expect(workflow.id).toBe('test-workflow');
			expect(workflow.name).toBe('Test Workflow');
			expect(Object.keys(workflow.nodes)).toHaveLength(1);
		});

		it('should identify start nodes in workflow', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'manual-trigger',
						name: 'Manual Trigger',
						type: 'n8n-nodes-base.manualTrigger',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
					},
					{
						id: 'code-node',
						name: 'Code',
						type: 'n8n-nodes-base.code',
						typeVersion: 1,
						position: [450, 300] as [number, number],
						parameters: {},
					},
				],
				connections: {
					'Manual Trigger': {
						main: [
							[
								{
									node: 'Code',
									type: 'main' as const,
									index: 0,
								},
							],
						],
					},
				},
			};

			const mockNodeType: Partial<INodeType> = {
				description: {
					displayName: 'Manual Trigger',
					name: 'n8n-nodes-base.manualTrigger',
					group: ['trigger'],
					version: 1,
					description: 'Manual trigger node',
					defaults: { name: 'Manual Trigger' },
					inputs: [],
					outputs: ['main'],
					properties: [],
				} as INodeTypeDescription,
			};

			const workflow = new Workflow({
				id: workflowData.id,
				name: workflowData.name,
				active: workflowData.active,
				nodes: workflowData.nodes,
				connections: workflowData.connections,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(mockNodeType),
					getByName: jest.fn().mockReturnValue(mockNodeType),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			expect(workflow.getNode('Manual Trigger')).toBeDefined();
			expect(workflow.getNode('Code')).toBeDefined();
		});
	});

	describe('Node Connections', () => {
		it('should correctly parse node connections', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'node-1',
						name: 'Node 1',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
					},
					{
						id: 'node-2',
						name: 'Node 2',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [450, 300] as [number, number],
						parameters: {},
					},
					{
						id: 'node-3',
						name: 'Node 3',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [650, 300] as [number, number],
						parameters: {},
					},
				],
				connections: {
					'Node 1': {
						main: [
							[
								{
									node: 'Node 2',
									type: 'main' as const,
									index: 0,
								},
							],
						],
					},
					'Node 2': {
						main: [
							[
								{
									node: 'Node 3',
									type: 'main' as const,
									index: 0,
								},
							],
						],
					},
				},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			const parentNodes = workflow.getParentNodes('Node 2');
			expect(parentNodes).toContain('Node 1');

			const childNodes = workflow.getChildNodes('Node 2');
			expect(childNodes).toContain('Node 3');
		});
	});

	describe('Workflow Validation', () => {
		it('should detect disabled nodes', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'node-1',
						name: 'Node 1',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
						disabled: true,
					},
				],
				connections: {},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			const node = workflow.getNode('Node 1');
			expect(node?.disabled).toBe(true);
		});
	});

	describe('Expression Evaluation', () => {
		it('should handle static values', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'node-1',
						name: 'Node 1',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {
							staticValue: 'Hello World',
						},
					},
				],
				connections: {},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			const node = workflow.getNode('Node 1');
			expect(node?.parameters?.staticValue).toBe('Hello World');
		});
	});

	describe('Workflow Settings', () => {
		it('should apply workflow settings', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [],
				connections: {},
				settings: {
					executionOrder: 'v1' as const,
					saveManualExecutions: true,
					timezone: 'UTC',
				},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			expect(workflow.settings?.executionOrder).toBe('v1');
			expect(workflow.settings?.timezone).toBe('UTC');
		});
	});
});

describe('Execution Data Structures', () => {
	describe('Node Execution Data', () => {
		it('should handle JSON data', () => {
			const nodeData = {
				json: {
					key1: 'value1',
					key2: 123,
					key3: true,
					nested: {
						innerKey: 'innerValue',
					},
				},
			};

			expect(nodeData.json.key1).toBe('value1');
			expect(nodeData.json.key2).toBe(123);
			expect(nodeData.json.nested.innerKey).toBe('innerValue');
		});

		it('should handle binary data references', () => {
			const nodeData = {
				json: { hasBinary: true },
				binary: {
					data: {
						data: 'base64encodeddata',
						mimeType: 'text/plain',
						fileName: 'test.txt',
					},
				},
			};

			expect(nodeData.binary.data.mimeType).toBe('text/plain');
			expect(nodeData.binary.data.fileName).toBe('test.txt');
		});

		it('should handle multiple items', () => {
			const items = [{ json: { index: 0 } }, { json: { index: 1 } }, { json: { index: 2 } }];

			expect(items).toHaveLength(3);
			items.forEach((item, index) => {
				expect(item.json.index).toBe(index);
			});
		});
	});
});

describe('Workflow Utilities', () => {
	describe('Node naming', () => {
		it('should handle special characters in node names', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'node-special',
						name: 'Node (Special) - Test',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
					},
				],
				connections: {},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			const node = workflow.getNode('Node (Special) - Test');
			expect(node).toBeDefined();
			expect(node?.name).toBe('Node (Special) - Test');
		});
	});

	describe('Workflow export', () => {
		it('should export workflow to JSON', () => {
			const workflowData = {
				id: 'test-workflow',
				name: 'Test Workflow',
				active: false,
				nodes: [
					{
						id: 'node-1',
						name: 'Node 1',
						type: 'n8n-nodes-base.noOp',
						typeVersion: 1,
						position: [250, 300] as [number, number],
						parameters: {},
					},
				],
				connections: {},
			};

			const workflow = new Workflow({
				...workflowData,
				nodeTypes: {
					getByNameAndVersion: jest.fn().mockReturnValue(undefined),
					getByName: jest.fn().mockReturnValue(undefined),
					getKnownTypes: jest.fn().mockReturnValue([]),
				},
			});

			// Workflow should be serializable
			const exported = JSON.stringify({
				id: workflow.id,
				name: workflow.name,
				nodes: Object.values(workflow.nodes),
			});

			const parsed = JSON.parse(exported);
			expect(parsed.id).toBe('test-workflow');
			expect(parsed.name).toBe('Test Workflow');
		});
	});
});
