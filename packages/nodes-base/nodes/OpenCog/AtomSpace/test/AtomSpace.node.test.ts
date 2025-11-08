import type { INodeTypes } from 'n8n-workflow';
import { NodeHelpers } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import { AtomSpace } from '../AtomSpace.node';

describe('AtomSpace Node', () => {
	let atomSpace: AtomSpace;
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		atomSpace = new AtomSpace();
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn(),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;
	});

	// Helper function to create merged context for execute
	const createContext = () => {
		const context = Object.create(atomSpace);
		Object.assign(context, mockExecuteFunctions);
		return context;
	};

	describe('Node Properties', () => {
		test('should have correct node properties', () => {
			expect(atomSpace.description.name).toBe('atomSpace');
			expect(atomSpace.description.displayName).toBe('OpenCog AtomSpace');
			expect(atomSpace.description.group).toContain('transform');
		});

		test('should have correct operations', () => {
			const operations = atomSpace.description.properties.find(p => p.name === 'operation');
			expect(operations).toBeDefined();
			expect(operations?.type).toBe('options');
			
			const operationOptions = operations?.options as Array<{ value: string }>;
			const operationValues = operationOptions.map(op => op.value);
			
			expect(operationValues).toContain('addAtom');
			expect(operationValues).toContain('queryAtoms');
			expect(operationValues).toContain('patternMatch');
			expect(operationValues).toContain('getTruthValue');
			expect(operationValues).toContain('setTruthValue');
		});
	});

	describe('Add Atom Operation', () => {
		test('should add atom successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('addAtom') // operation
				.mockReturnValueOnce('ConceptNode') // atomType
				.mockReturnValueOnce('TestConcept') // atomName
				.mockReturnValueOnce({ values: { strength: 0.8, confidence: 0.9 } }); // truthValue

			// Create a merged context that has both AtomSpace methods and IExecuteFunctions methods
			const context = Object.create(atomSpace);
			Object.assign(context, mockExecuteFunctions);
			
			const result = await atomSpace.execute.call(context);
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('addAtom');
			expect(output.atomType).toBe('ConceptNode');
			expect(output.atomName).toBe('TestConcept');
			expect(output.success).toBe(true);
			expect(output.truthValue).toEqual({ strength: 0.8, confidence: 0.9 });
		});

		test('should handle different atom types', async () => {
			const atomTypes = ['ConceptNode', 'PredicateNode', 'InheritanceLink'];
			
			for (const atomType of atomTypes) {
				mockExecuteFunctions.getNodeParameter = jest.fn()
					.mockReturnValueOnce('addAtom')
					.mockReturnValueOnce(atomType)
					.mockReturnValueOnce(`Test${atomType}`)
					.mockReturnValueOnce({ values: { strength: 0.7, confidence: 0.8 } });

				const result = await atomSpace.execute.call(createContext());
				const output = result[0][0].json;
				
				expect(output.atomType).toBe(atomType);
			}
		});
	});

	describe('Query Atoms Operation', () => {
		test('should query atoms successfully', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('queryAtoms') // operation
				.mockReturnValueOnce('TestQuery') // atomName
				.mockReturnValueOnce(5); // maxResults

			const result = await atomSpace.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('queryAtoms');
			expect(output.query).toBe('TestQuery');
			expect(output.results).toBeDefined();
			expect(Array.isArray(output.results)).toBe(true);
			expect(output.totalCount).toBeGreaterThanOrEqual(0);
		});
	});

	describe('Pattern Match Operation', () => {
		test('should perform pattern matching', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('patternMatch') // operation
				.mockReturnValueOnce('(InheritanceLink (VariableNode "$X") (ConceptNode "Animal"))') // pattern
				.mockReturnValueOnce(10); // maxResults

			const result = await atomSpace.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('patternMatch');
			expect(output.pattern).toContain('InheritanceLink');
			expect(output.matches).toBeDefined();
			expect(Array.isArray(output.matches)).toBe(true);
		});
	});

	describe('Truth Value Operations', () => {
		test('should get truth value', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('getTruthValue') // operation
				.mockReturnValueOnce('TestAtom'); // atomName

			const result = await atomSpace.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.operation).toBe('getTruthValue');
			expect(output.atomName).toBe('TestAtom');
			expect(output.truthValue).toBeDefined();
			expect(output.truthValue.strength).toBeGreaterThanOrEqual(0);
			expect(output.truthValue.confidence).toBeGreaterThanOrEqual(0);
		});

		test('should set truth value', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('setTruthValue') // operation
				.mockReturnValueOnce('TestAtom') // atomName
				.mockReturnValueOnce({ values: { strength: 0.6, confidence: 0.7 } }); // truthValue

			const result = await atomSpace.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.operation).toBe('setTruthValue');
			expect(output.success).toBe(true);
			expect(output.newTruthValue).toEqual({ strength: 0.6, confidence: 0.7 });
		});
	});

	describe('Error Handling', () => {
		test('should handle unknown operation', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('unknownOperation');
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await atomSpace.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.error).toContain('Unknown operation');
		});
	});
});