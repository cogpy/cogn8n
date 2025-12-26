/**
 * Comprehensive Test Utilities for n8n Backend Testing
 *
 * This module provides reusable test utilities, mocks, and helpers
 * for unit and integration testing across n8n backend packages.
 */

import type {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
} from 'n8n-workflow';

/**
 * Creates a mock execution context for testing nodes
 */
export function createMockExecuteFunctions(
	overrides: Partial<IExecuteFunctions> = {},
): IExecuteFunctions {
	return {
		getInputData: jest.fn().mockReturnValue([{ json: {} }]),
		getNodeParameter: jest.fn(),
		getNode: jest.fn().mockReturnValue({ name: 'TestNode', type: 'test' }),
		getMode: jest.fn().mockReturnValue('manual'),
		getCredentials: jest.fn().mockResolvedValue({}),
		getWorkflowStaticData: jest.fn().mockReturnValue({}),
		helpers: {
			returnJsonArray: jest.fn((data) => data.map((item: unknown) => ({ json: item }))),
			prepareBinaryData: jest.fn(),
			getBinaryDataBuffer: jest.fn(),
			request: jest.fn(),
			requestWithAuthentication: jest.fn(),
			httpRequest: jest.fn(),
			httpRequestWithAuthentication: jest.fn(),
		},
		continueOnFail: jest.fn().mockReturnValue(false),
		...overrides,
	} as unknown as IExecuteFunctions;
}

/**
 * Creates mock node execution data
 */
export function createMockNodeExecutionData(
	json: IDataObject = {},
	binary?: IBinaryKeyData,
): INodeExecutionData {
	return {
		json,
		...(binary && { binary }),
	};
}

/**
 * Helper to execute a node and return results
 */
export async function executeNode(
	nodeType: INodeType,
	executeFunctions: IExecuteFunctions,
): Promise<INodeExecutionData[][] | null> {
	if (nodeType.execute) {
		const result = await nodeType.execute.call(executeFunctions);
		return result as INodeExecutionData[][] | null;
	}
	return null;
}

/**
 * Creates a mock workflow for testing
 */
export function createMockWorkflow(overrides: Record<string, unknown> = {}) {
	return {
		id: 'test-workflow-id',
		name: 'Test Workflow',
		active: false,
		nodes: [],
		connections: {},
		settings: {},
		...overrides,
	};
}

/**
 * Creates a mock user for testing
 */
export function createMockUser(overrides: Record<string, unknown> = {}) {
	return {
		id: 'test-user-id',
		email: 'test@example.com',
		firstName: 'Test',
		lastName: 'User',
		role: 'global:member',
		...overrides,
	};
}

/**
 * Creates a mock credential for testing
 */
export function createMockCredential(overrides: Record<string, unknown> = {}) {
	return {
		id: 'test-credential-id',
		name: 'Test Credential',
		type: 'testCredentialType',
		data: {},
		...overrides,
	};
}

/**
 * Waits for a condition to be true
 */
export async function waitFor(
	condition: () => boolean | Promise<boolean>,
	timeout = 5000,
	interval = 100,
): Promise<void> {
	const startTime = Date.now();
	while (!(await condition())) {
		if (Date.now() - startTime > timeout) {
			throw new Error('Timeout waiting for condition');
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
}

/**
 * Creates a deferred promise for testing async operations
 */
export function createDeferred<T>() {
	let resolve: (value: T) => void;
	let reject: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Captures console output during tests
 */
export function captureConsole() {
	const logs: string[] = [];
	const errors: string[] = [];
	const warns: string[] = [];

	const originalLog = console.log;
	const originalError = console.error;
	const originalWarn = console.warn;

	console.log = (...args: unknown[]) => logs.push(args.join(' '));
	console.error = (...args: unknown[]) => errors.push(args.join(' '));
	console.warn = (...args: unknown[]) => warns.push(args.join(' '));

	return {
		logs,
		errors,
		warns,
		restore: () => {
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;
		},
	};
}

/**
 * Creates a timeout promise for testing
 */
export function createTimeout(ms: number): Promise<never> {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
	});
}

/**
 * Race a promise against a timeout
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([promise, createTimeout(ms)]);
}
