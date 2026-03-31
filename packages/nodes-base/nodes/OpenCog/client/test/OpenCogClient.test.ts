import {
	OpenCogClient,
	getOpenCogClient,
	resetOpenCogClient,
} from '../OpenCogClient';

describe('OpenCogClient', () => {
	describe('Simulation mode', () => {
		let client: OpenCogClient;

		beforeEach(() => {
			client = new OpenCogClient({ serverUrl: '', useSimulation: true });
		});

		test('should start in simulation mode when useSimulation is true', async () => {
			await client.connect();
			expect(client.isSimulationMode()).toBe(true);
		});

		test('should start in simulation mode when no serverUrl is provided', async () => {
			const c = new OpenCogClient({ serverUrl: '' });
			await c.connect();
			expect(c.isSimulationMode()).toBe(true);
		});

		test('connect() returns true in simulation mode', async () => {
			const result = await client.connect();
			expect(result).toBe(true);
		});

		test('isConnected() returns false in simulation mode', async () => {
			await client.connect();
			expect(client.isConnected()).toBe(false);
		});

		test('addAtom() returns an atom with the correct type and name', async () => {
			await client.connect();
			const atom = await client.addAtom('ConceptNode', 'Cat', { strength: 0.9, confidence: 0.8 });
			expect(atom.type).toBe('ConceptNode');
			expect(atom.name).toBe('Cat');
			expect(atom.id).toMatch(/^atom_/);
			expect(atom.truthValue?.strength).toBe(0.9);
			expect(atom.truthValue?.confidence).toBe(0.8);
		});

		test('addAtom() uses default truth value when none provided', async () => {
			await client.connect();
			const atom = await client.addAtom('ConceptNode', 'Dog');
			expect(atom.truthValue).toEqual({ strength: 0.8, confidence: 0.9 });
		});

		test('queryAtoms() returns a QueryResult', async () => {
			await client.connect();
			const result = await client.queryAtoms('Cat', 'ConceptNode', 5);
			expect(result).toHaveProperty('atoms');
			expect(result).toHaveProperty('totalCount');
			expect(Array.isArray(result.atoms)).toBe(true);
			expect(result.atoms.length).toBeLessThanOrEqual(5);
			expect(result.totalCount).toBe(result.atoms.length);
		});

		test('queryAtoms() respects maxResults limit', async () => {
			await client.connect();
			const result = await client.queryAtoms(undefined, undefined, 2);
			expect(result.atoms.length).toBeLessThanOrEqual(2);
		});

		test('patternMatch() returns a PatternMatchResult', async () => {
			await client.connect();
			const result = await client.patternMatch('(InheritanceLink $X $Y)', 10);
			expect(result).toHaveProperty('matches');
			expect(result).toHaveProperty('matchCount');
			expect(Array.isArray(result.matches)).toBe(true);
			expect(result.matchCount).toBe(result.matches.length);
		});

		test('getTruthValue() returns a TruthValue', async () => {
			await client.connect();
			const tv = await client.getTruthValue('atom_123');
			expect(tv).not.toBeNull();
			expect(tv).toHaveProperty('strength');
			expect(tv).toHaveProperty('confidence');
			expect(typeof tv!.strength).toBe('number');
			expect(typeof tv!.confidence).toBe('number');
		});

		test('setTruthValue() returns true', async () => {
			await client.connect();
			const result = await client.setTruthValue('atom_123', { strength: 0.5, confidence: 0.7 });
			expect(result).toBe(true);
		});

		test('forwardChaining() returns a ReasoningResult', async () => {
			await client.connect();
			const result = await client.forwardChaining(['A is B', 'B is C'], 5, 0.5);
			expect(result).toHaveProperty('conclusions');
			expect(result).toHaveProperty('inferenceSteps');
			expect(result).toHaveProperty('success');
			expect(result.success).toBe(true);
			expect(Array.isArray(result.conclusions)).toBe(true);
		});

		test('backwardChaining() returns a ReasoningResult', async () => {
			await client.connect();
			const result = await client.backwardChaining('Is A C?', 5, 0.5);
			expect(result).toHaveProperty('conclusions');
			expect(result).toHaveProperty('inferenceSteps');
			expect(result).toHaveProperty('success');
		});

		test('mineFrequentPatterns() returns an array', async () => {
			await client.connect();
			const patterns = await client.mineFrequentPatterns(
				[{ a: 1 }, { a: 1, b: 2 }],
				0.1,
				10,
			);
			expect(Array.isArray(patterns)).toBe(true);
		});

		test('discoverAssociationRules() returns an array', async () => {
			await client.connect();
			const rules = await client.discoverAssociationRules(
				[{ a: 1 }, { a: 1, b: 2 }],
				0.1,
				0.5,
			);
			expect(Array.isArray(rules)).toBe(true);
		});

		test('createAgent() returns agentId and status', async () => {
			await client.connect();
			const agent = await client.createAgent('TestAgent', 'goal-oriented', {});
			expect(agent.agentId).toBeTruthy();
			expect(agent.status).toBe('created');
		});

		test('runAgentStep() returns output and state', async () => {
			await client.connect();
			const step = await client.runAgentStep('agent_abc', { input: 'test' });
			expect(step).toHaveProperty('output');
			expect(step).toHaveProperty('state');
		});
	});

	describe('getOpenCogClient / resetOpenCogClient', () => {
		beforeEach(() => {
			resetOpenCogClient();
		});

		afterEach(() => {
			resetOpenCogClient();
		});

		test('getOpenCogClient() returns the same instance for the same serverUrl', () => {
			const c1 = getOpenCogClient({ serverUrl: 'http://localhost:5000', useSimulation: true });
			const c2 = getOpenCogClient({ serverUrl: 'http://localhost:5000', useSimulation: true });
			expect(c1).toBe(c2);
		});

		test('getOpenCogClient() returns different instances for different serverUrls', () => {
			const c1 = getOpenCogClient({ serverUrl: 'http://localhost:5000', useSimulation: true });
			const c2 = getOpenCogClient({ serverUrl: 'http://localhost:9000', useSimulation: true });
			expect(c1).not.toBe(c2);
		});

		test('resetOpenCogClient(serverUrl) clears only that entry', () => {
			const c1 = getOpenCogClient({ serverUrl: 'http://localhost:5000', useSimulation: true });
			getOpenCogClient({ serverUrl: 'http://localhost:9000', useSimulation: true });

			resetOpenCogClient('http://localhost:5000');

			const c1New = getOpenCogClient({
				serverUrl: 'http://localhost:5000',
				useSimulation: true,
			});
			expect(c1New).not.toBe(c1);
		});

		test('resetOpenCogClient() without arg clears all entries', () => {
			const c1 = getOpenCogClient({ serverUrl: 'http://localhost:5000', useSimulation: true });
			resetOpenCogClient();
			const c1New = getOpenCogClient({
				serverUrl: 'http://localhost:5000',
				useSimulation: true,
			});
			expect(c1New).not.toBe(c1);
		});

		test('getOpenCogClient() returns different instances for same serverUrl but different usernames', () => {
			const c1 = getOpenCogClient({
				serverUrl: 'http://localhost:5000',
				username: 'user1',
				useSimulation: true,
			});
			const c2 = getOpenCogClient({
				serverUrl: 'http://localhost:5000',
				username: 'user2',
				useSimulation: true,
			});
			expect(c1).not.toBe(c2);
		});
	});

	describe('Real server mode (HTTP error handling)', () => {
		const originalFetch = global.fetch;

		afterEach(() => {
			global.fetch = originalFetch;
		});

		test('connect() falls back to simulation when server returns an error', async () => {
			global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

			const client = new OpenCogClient({
				serverUrl: 'http://localhost:5000',
				useSimulation: true,
				timeout: 1000,
			});
			const result = await client.connect();
			expect(result).toBe(true);
			expect(client.isSimulationMode()).toBe(true);
		});

		test('connect() throws when server fails and simulation is disabled', async () => {
			global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

			const client = new OpenCogClient({
				serverUrl: 'http://localhost:5000',
				useSimulation: false,
				timeout: 1000,
			});
			await expect(client.connect()).rejects.toThrow(
				'OpenCog server not available and simulation mode is disabled',
			);
		});

		test('connect() sets connected=true when server responds ok', async () => {
			global.fetch = jest.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ status: 'ok', version: '1.0.0' }),
			} as unknown as Response);

			const client = new OpenCogClient({
				serverUrl: 'http://localhost:5000',
				useSimulation: false,
				timeout: 1000,
			});
			const result = await client.connect();
			expect(result).toBe(true);
			expect(client.isConnected()).toBe(true);
			expect(client.isSimulationMode()).toBe(false);
		});
	});
});
