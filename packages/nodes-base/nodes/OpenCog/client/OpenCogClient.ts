/**
 * OpenCog Client
 *
 * A client for communicating with real OpenCog CogServer instances.
 * Provides methods for AtomSpace operations, reasoning, pattern mining,
 * and cognitive agent interactions.
 *
 * Falls back to simulation mode when the server is unavailable.
 */

export interface OpenCogCredentials {
	serverUrl: string;
	apiKey?: string;
	username?: string;
	password?: string;
	timeout?: number;
	useSimulation?: boolean;
}

export interface Atom {
	id: string;
	type: string;
	name?: string;
	outgoing?: string[];
	truthValue?: TruthValue;
	attentionValue?: AttentionValue;
}

export interface TruthValue {
	strength: number;
	confidence: number;
}

export interface AttentionValue {
	sti: number; // Short-term importance
	lti: number; // Long-term importance
	vlti: boolean; // Very-long-term importance flag
}

export interface QueryResult {
	atoms: Atom[];
	totalCount: number;
}

export interface PatternMatchResult {
	matches: Array<{
		matchId: string;
		bindings: Record<string, string>;
		truthValue: TruthValue;
	}>;
	matchCount: number;
}

export interface ReasoningResult {
	conclusions: Array<{
		statement: string;
		confidence: number;
		derivationPath: string[];
	}>;
	inferenceSteps: number;
	success: boolean;
}

/**
 * OpenCog Client for real server communication
 */
export class OpenCogClient {
	private credentials: OpenCogCredentials;
	private connected: boolean = false;
	private simulationMode: boolean = true;
	private serverVersion: string = '';

	constructor(credentials: OpenCogCredentials) {
		this.credentials = {
			timeout: 30000,
			useSimulation: true,
			...credentials,
		};
		this.simulationMode = credentials.useSimulation ?? true;
	}

	/**
	 * Test connection to OpenCog server
	 */
	async connect(): Promise<boolean> {
		if (!this.credentials.serverUrl) {
			console.log('OpenCog: No server URL provided, using simulation mode');
			this.simulationMode = true;
			return true;
		}

		try {
			const response = await this.request('/api/v1/status', 'GET');
			if (response && response.status === 'ok') {
				this.connected = true;
				this.simulationMode = false;
				this.serverVersion = response.version || 'unknown';
				console.log(`OpenCog: Connected to server v${this.serverVersion}`);
				return true;
			}
		} catch (error) {
			console.log(`OpenCog: Server not available, using simulation mode. Error: ${error}`);
		}

		if (this.credentials.useSimulation) {
			this.simulationMode = true;
			return true;
		}

		throw new Error('OpenCog server not available and simulation mode is disabled');
	}

	/**
	 * Check if using simulation mode
	 */
	isSimulationMode(): boolean {
		return this.simulationMode;
	}

	/**
	 * Get connection status
	 */
	isConnected(): boolean {
		return this.connected;
	}

	// ============================================
	// AtomSpace Operations
	// ============================================

	/**
	 * Add an atom to the AtomSpace
	 */
	async addAtom(
		type: string,
		name: string,
		truthValue?: TruthValue,
		outgoing?: string[],
	): Promise<Atom> {
		if (this.simulationMode) {
			return this.simulateAddAtom(type, name, truthValue, outgoing);
		}

		const response = await this.request('/api/v1/atoms', 'POST', {
			type,
			name,
			truthValue: truthValue || { strength: 0.8, confidence: 0.9 },
			outgoing,
		});

		return response.atom;
	}

	/**
	 * Query atoms from AtomSpace
	 */
	async queryAtoms(name?: string, type?: string, maxResults: number = 100): Promise<QueryResult> {
		if (this.simulationMode) {
			return this.simulateQueryAtoms(name, type, maxResults);
		}

		const params = new URLSearchParams();
		if (name) params.append('name', name);
		if (type) params.append('type', type);
		params.append('limit', maxResults.toString());

		const response = await this.request(`/api/v1/atoms?${params.toString()}`, 'GET');
		return {
			atoms: response.atoms,
			totalCount: response.totalCount,
		};
	}

	/**
	 * Perform pattern matching
	 */
	async patternMatch(pattern: string, maxResults: number = 100): Promise<PatternMatchResult> {
		if (this.simulationMode) {
			return this.simulatePatternMatch(pattern, maxResults);
		}

		const response = await this.request('/api/v1/pattern-match', 'POST', {
			pattern,
			maxResults,
		});

		return {
			matches: response.matches,
			matchCount: response.matchCount,
		};
	}

	/**
	 * Get truth value of an atom
	 */
	async getTruthValue(atomId: string): Promise<TruthValue | null> {
		if (this.simulationMode) {
			return this.simulateGetTruthValue(atomId);
		}

		const response = await this.request(`/api/v1/atoms/${atomId}/truth-value`, 'GET');
		return response.truthValue;
	}

	/**
	 * Set truth value of an atom
	 */
	async setTruthValue(atomId: string, truthValue: TruthValue): Promise<boolean> {
		if (this.simulationMode) {
			return true;
		}

		await this.request(`/api/v1/atoms/${atomId}/truth-value`, 'PUT', truthValue);
		return true;
	}

	// ============================================
	// Reasoning Operations
	// ============================================

	/**
	 * Perform forward chaining inference
	 */
	async forwardChaining(
		premises: string[],
		maxSteps: number = 10,
		confidenceThreshold: number = 0.5,
	): Promise<ReasoningResult> {
		if (this.simulationMode) {
			return this.simulateForwardChaining(premises, maxSteps, confidenceThreshold);
		}

		const response = await this.request('/api/v1/reasoning/forward-chain', 'POST', {
			premises,
			maxSteps,
			confidenceThreshold,
		});

		return response;
	}

	/**
	 * Perform backward chaining inference
	 */
	async backwardChaining(
		goal: string,
		maxSteps: number = 10,
		confidenceThreshold: number = 0.5,
	): Promise<ReasoningResult> {
		if (this.simulationMode) {
			return this.simulateBackwardChaining(goal, maxSteps, confidenceThreshold);
		}

		const response = await this.request('/api/v1/reasoning/backward-chain', 'POST', {
			goal,
			maxSteps,
			confidenceThreshold,
		});

		return response;
	}

	// ============================================
	// Pattern Mining Operations
	// ============================================

	/**
	 * Mine frequent patterns
	 */
	async mineFrequentPatterns(
		data: unknown[],
		minSupport: number = 0.1,
		maxPatterns: number = 100,
	): Promise<unknown[]> {
		if (this.simulationMode) {
			return this.simulateMineFrequentPatterns(data, minSupport, maxPatterns);
		}

		const response = await this.request('/api/v1/mining/frequent-patterns', 'POST', {
			data,
			minSupport,
			maxPatterns,
		});

		return response.patterns;
	}

	/**
	 * Discover association rules
	 */
	async discoverAssociationRules(
		data: unknown[],
		minSupport: number = 0.1,
		minConfidence: number = 0.5,
	): Promise<unknown[]> {
		if (this.simulationMode) {
			return this.simulateDiscoverAssociationRules(data, minSupport, minConfidence);
		}

		const response = await this.request('/api/v1/mining/association-rules', 'POST', {
			data,
			minSupport,
			minConfidence,
		});

		return response.rules;
	}

	// ============================================
	// Cognitive Agent Operations
	// ============================================

	/**
	 * Create a cognitive agent
	 */
	async createAgent(
		name: string,
		type: string,
		config: Record<string, unknown>,
	): Promise<{ agentId: string; status: string }> {
		if (this.simulationMode) {
			return {
				agentId: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				status: 'created',
			};
		}

		const response = await this.request('/api/v1/agents', 'POST', {
			name,
			type,
			config,
		});

		return response;
	}

	/**
	 * Run agent step
	 */
	async runAgentStep(
		agentId: string,
		input: unknown,
	): Promise<{ output: unknown; state: Record<string, unknown> }> {
		if (this.simulationMode) {
			return this.simulateAgentStep(agentId, input);
		}

		const response = await this.request(`/api/v1/agents/${agentId}/step`, 'POST', {
			input,
		});

		return response;
	}

	// ============================================
	// Private Methods
	// ============================================

	/**
	 * Make HTTP request to OpenCog server
	 */
	private async request(path: string, method: string, body?: unknown): Promise<any> {
		const url = `${this.credentials.serverUrl}${path}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (this.credentials.apiKey) {
			headers['X-API-Key'] = this.credentials.apiKey;
		}

		if (this.credentials.username && this.credentials.password) {
			const auth = Buffer.from(
				`${this.credentials.username}:${this.credentials.password}`,
			).toString('base64');
			headers['Authorization'] = `Basic ${auth}`;
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.credentials.timeout);

		try {
			const response = await fetch(url, {
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timeout);

			if (!response.ok) {
				throw new Error(`OpenCog API error: ${response.status} ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			clearTimeout(timeout);
			throw error;
		}
	}

	// ============================================
	// Simulation Methods (Fallback)
	// ============================================

	private simulateAddAtom(
		type: string,
		name: string,
		truthValue?: TruthValue,
		outgoing?: string[],
	): Atom {
		return {
			id: `atom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			type,
			name,
			outgoing,
			truthValue: truthValue || { strength: 0.8, confidence: 0.9 },
		};
	}

	private simulateQueryAtoms(name?: string, type?: string, maxResults: number = 100): QueryResult {
		const numResults = Math.min(maxResults, Math.floor(Math.random() * 10) + 1);
		const atoms: Atom[] = [];

		for (let i = 0; i < numResults; i++) {
			atoms.push({
				id: `atom_${i}_${Date.now()}`,
				type: type || 'ConceptNode',
				name: name ? `${name}_${i}` : `Concept_${i}`,
				truthValue: {
					strength: Math.random(),
					confidence: Math.random(),
				},
			});
		}

		return { atoms, totalCount: atoms.length };
	}

	private simulatePatternMatch(_pattern: string, maxResults: number): PatternMatchResult {
		const numMatches = Math.min(maxResults, Math.floor(Math.random() * 5) + 1);
		const matches = [];

		for (let i = 0; i < numMatches; i++) {
			matches.push({
				matchId: `match_${i}`,
				bindings: {
					$X: `Entity_${i}`,
					$Y: `Property_${i}`,
				},
				truthValue: {
					strength: Math.random(),
					confidence: Math.random(),
				},
			});
		}

		return { matches, matchCount: matches.length };
	}

	private simulateGetTruthValue(_atomId: string): TruthValue {
		return {
			strength: Math.random(),
			confidence: Math.random(),
		};
	}

	private simulateForwardChaining(
		premises: string[],
		maxSteps: number,
		confidenceThreshold: number,
	): ReasoningResult {
		const numConclusions = Math.floor(Math.random() * 5) + 1;
		const conclusions = [];

		for (let i = 0; i < numConclusions; i++) {
			conclusions.push({
				statement: `Conclusion_${i} derived from ${premises.length} premises`,
				confidence: confidenceThreshold + Math.random() * (1 - confidenceThreshold),
				derivationPath: premises.slice(0, Math.floor(Math.random() * premises.length) + 1),
			});
		}

		return {
			conclusions,
			inferenceSteps: Math.min(maxSteps, Math.floor(Math.random() * maxSteps) + 1),
			success: true,
		};
	}

	private simulateBackwardChaining(
		goal: string,
		maxSteps: number,
		_confidenceThreshold: number,
	): ReasoningResult {
		const proved = Math.random() > 0.3;

		return {
			conclusions: proved
				? [
						{
							statement: goal,
							confidence: 0.7 + Math.random() * 0.3,
							derivationPath: ['Premise_1', 'Premise_2', goal],
						},
					]
				: [],
			inferenceSteps: Math.min(maxSteps, Math.floor(Math.random() * maxSteps) + 1),
			success: proved,
		};
	}

	private simulateMineFrequentPatterns(
		data: unknown[],
		minSupport: number,
		maxPatterns: number,
	): unknown[] {
		const numPatterns = Math.min(maxPatterns, Math.floor(Math.random() * 10) + 1);
		const patterns = [];

		for (let i = 0; i < numPatterns; i++) {
			patterns.push({
				id: `pattern_${i}`,
				items: [`item_${i}_a`, `item_${i}_b`],
				support: minSupport + Math.random() * (1 - minSupport),
				frequency: Math.floor(Math.random() * (data.length || 100)) + 1,
			});
		}

		return patterns.sort((a: any, b: any) => b.support - a.support);
	}

	private simulateDiscoverAssociationRules(
		_data: unknown[],
		minSupport: number,
		minConfidence: number,
	): unknown[] {
		const numRules = Math.floor(Math.random() * 8) + 1;
		const rules = [];

		for (let i = 0; i < numRules; i++) {
			rules.push({
				id: `rule_${i}`,
				antecedent: [`condition_${i}_a`],
				consequent: [`result_${i}_b`],
				support: minSupport + Math.random() * (1 - minSupport),
				confidence: minConfidence + Math.random() * (1 - minConfidence),
				lift: 1 + Math.random() * 2,
			});
		}

		return rules;
	}

	private simulateAgentStep(
		_agentId: string,
		input: unknown,
	): { output: unknown; state: Record<string, unknown> } {
		return {
			output: {
				processed: true,
				input,
				timestamp: new Date().toISOString(),
				decision: `Action_${Math.floor(Math.random() * 5)}`,
			},
			state: {
				attention: Math.random(),
				energy: Math.random(),
				learningProgress: Math.random(),
			},
		};
	}
}

/**
 * Create a singleton client instance
 */
let clientInstance: OpenCogClient | null = null;

export function getOpenCogClient(credentials: OpenCogCredentials): OpenCogClient {
	if (!clientInstance) {
		clientInstance = new OpenCogClient(credentials);
	}
	return clientInstance;
}

export function resetOpenCogClient(): void {
	clientInstance = null;
}
