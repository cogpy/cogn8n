/**
 * Natural Language Query Interface for AtomSpace
 * Enables natural language queries to be translated into AtomSpace query patterns
 */

export interface NLQueryResult {
	query: string;
	pattern: string;
	confidence: number;
	interpretation: string;
}

export class NaturalLanguageQueryParser {
	/**
	 * Parse a natural language query into an AtomSpace query pattern
	 */
	static parse(query: string): NLQueryResult {
		const normalizedQuery = query.toLowerCase().trim();

		// Pattern: "What is X?"
		let match = normalizedQuery.match(/^what is (.+)\??$/);
		if (match) {
			const concept = match[1];
			return {
				query,
				pattern: `(Get (TypedVariable $x ConceptNode) (Inheritance (Concept "${concept}") $x))`,
				confidence: 0.85,
				interpretation: `Finding what "${concept}" is related to`,
			};
		}

		// Pattern: "Is X a Y?"
		match = normalizedQuery.match(/^is (.+) a (.+)\??$/);
		if (match) {
			const concept1 = match[1];
			const concept2 = match[2];
			return {
				query,
				pattern: `(Get (Inheritance (Concept "${concept1}") (Concept "${concept2}")))`,
				confidence: 0.9,
				interpretation: `Checking if "${concept1}" is a "${concept2}"`,
			};
		}

		// Pattern: "What are the properties of X?"
		match = normalizedQuery.match(/^what are the properties of (.+)\??$/);
		if (match) {
			const concept = match[1];
			return {
				query,
				pattern: `(Get (TypedVariable $prop PredicateNode) (Evaluation $prop (Concept "${concept}")))`,
				confidence: 0.8,
				interpretation: `Finding properties of "${concept}"`,
			};
		}

		// Pattern: "Find all X that Y"
		match = normalizedQuery.match(/^find all (.+) that (.+)$/);
		if (match) {
			const type = match[1];
			const condition = match[2];
			return {
				query,
				pattern: `(Get (TypedVariable $x ConceptNode) (And (Type $x "${type}") (Predicate "${condition}" $x)))`,
				confidence: 0.75,
				interpretation: `Finding all "${type}" where condition: "${condition}"`,
			};
		}

		// Pattern: "How is X related to Y?"
		match = normalizedQuery.match(/^how is (.+) related to (.+)\??$/);
		if (match) {
			const concept1 = match[1];
			const concept2 = match[2];
			return {
				query,
				pattern: `(Get (TypedVariable $rel LinkNode) (Evaluation $rel (List (Concept "${concept1}") (Concept "${concept2}"))))`,
				confidence: 0.82,
				interpretation: `Finding relationships between "${concept1}" and "${concept2}"`,
			};
		}

		// Pattern: "Show me X"
		match = normalizedQuery.match(/^show me (.+)$/);
		if (match) {
			const concept = match[1];
			return {
				query,
				pattern: `(Get (Concept "${concept}"))`,
				confidence: 0.88,
				interpretation: `Retrieving information about "${concept}"`,
			};
		}

		// Pattern: "List all X"
		match = normalizedQuery.match(/^list all (.+)$/);
		if (match) {
			const type = match[1];
			return {
				query,
				pattern: `(Get (TypedVariable $x ConceptNode) (Type $x "${type}"))`,
				confidence: 0.85,
				interpretation: `Listing all instances of type "${type}"`,
			};
		}

		// Default fallback - keyword extraction
		const keywords = this.extractKeywords(normalizedQuery);
		return {
			query,
			pattern: `(Get (TypedVariable $x Node) (Or ${keywords.map((k) => `(Concept "${k}")`).join(' ')}))`,
			confidence: 0.5,
			interpretation: `Searching for keywords: ${keywords.join(', ')}`,
		};
	}

	/**
	 * Extract keywords from natural language query
	 */
	private static extractKeywords(query: string): string[] {
		// Remove common stop words
		const stopWords = new Set([
			'the',
			'a',
			'an',
			'is',
			'are',
			'was',
			'were',
			'be',
			'been',
			'being',
			'have',
			'has',
			'had',
			'do',
			'does',
			'did',
			'will',
			'would',
			'could',
			'should',
			'may',
			'might',
			'can',
			'of',
			'to',
			'in',
			'for',
			'on',
			'with',
			'at',
			'by',
			'from',
			'about',
			'what',
			'how',
			'why',
			'when',
			'where',
			'who',
		]);

		return query
			.toLowerCase()
			.replace(/[^\w\s]/g, '')
			.split(/\s+/)
			.filter((word) => word.length > 2 && !stopWords.has(word));
	}

	/**
	 * Generate examples of supported query patterns
	 */
	static getExamples(): string[] {
		return [
			'What is human?',
			'Is dog a mammal?',
			'What are the properties of car?',
			'Find all animals that fly',
			'How is Earth related to Sun?',
			'Show me solar system',
			'List all planets',
		];
	}

	/**
	 * Validate if a pattern is well-formed
	 */
	static validatePattern(pattern: string): { valid: boolean; error?: string } {
		try {
			// Basic validation - check balanced parentheses
			let depth = 0;
			for (const char of pattern) {
				if (char === '(') depth++;
				if (char === ')') depth--;
				if (depth < 0) {
					return { valid: false, error: 'Unbalanced parentheses' };
				}
			}
			if (depth !== 0) {
				return { valid: false, error: 'Unclosed parentheses' };
			}

			// Check for basic pattern structure
			if (!pattern.includes('(') || !pattern.includes(')')) {
				return { valid: false, error: 'Invalid pattern structure' };
			}

			return { valid: true };
		} catch (error) {
			return { valid: false, error: 'Pattern validation failed' };
		}
	}

	/**
	 * Enhance query with context
	 */
	static enhanceWithContext(query: string, context: Record<string, any>): NLQueryResult {
		const baseResult = this.parse(query);

		// Add context variables to pattern if available
		if (context.namespace) {
			baseResult.pattern = baseResult.pattern.replace(
				/Concept "([^"]+)"/g,
				`Concept "${context.namespace}:$1"`,
			);
		}

		if (context.truthValueFilter) {
			const { minStrength, minConfidence } = context.truthValueFilter;
			baseResult.pattern = `(And ${baseResult.pattern} (TruthValueGreaterThan ${minStrength} ${minConfidence}))`;
		}

		return baseResult;
	}
}

/**
 * Example usage in n8n node:
 *
 * const nlQuery = "What is human?";
 * const result = NaturalLanguageQueryParser.parse(nlQuery);
 * console.log(result.pattern); // AtomSpace query pattern
 * console.log(result.interpretation); // Human-readable interpretation
 * console.log(result.confidence); // Confidence score
 */
