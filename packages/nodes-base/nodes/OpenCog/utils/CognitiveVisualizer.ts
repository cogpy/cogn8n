/**
 * Visualization utilities for OpenCog cognitive workflows
 * Provides helpers to generate visualizations of AtomSpace, reasoning chains, and agent behavior
 */

export interface VisualizationData {
	type: 'atomspace' | 'reasoning' | 'agent' | 'pattern';
	data: any;
	format: 'mermaid' | 'graphviz' | 'json';
}

export class CognitiveVisualizer {
	/**
	 * Generate Mermaid diagram for AtomSpace structure
	 */
	static visualizeAtomSpace(atoms: Array<{ type: string; name: string; links?: string[] }>): string {
		let diagram = 'graph TD\n';

		// Create nodes
		atoms.forEach((atom, idx) => {
			const nodeId = `node${idx}`;
			const label = `${atom.type}: ${atom.name}`;
			const style = this.getNodeStyle(atom.type);
			diagram += `    ${nodeId}["${label}"]${style}\n`;
		});

		// Create links
		atoms.forEach((atom, idx) => {
			if (atom.links && Array.isArray(atom.links)) {
				atom.links.forEach((targetName) => {
					const targetIdx = atoms.findIndex((a) => a.name === targetName);
					if (targetIdx >= 0) {
						diagram += `    node${idx} --> node${targetIdx}\n`;
					}
				});
			}
		});

		return diagram;
	}

	/**
	 * Generate visualization for reasoning chain
	 */
	static visualizeReasoningChain(steps: Array<{ step: number; rule: string; conclusion: string }>): string {
		let diagram = 'graph LR\n';

		steps.forEach((step, idx) => {
			const nodeId = `step${idx}`;
			const label = `Step ${step.step}: ${step.rule}`;
			diagram += `    ${nodeId}["${label}"]\n`;

			if (idx > 0) {
				diagram += `    step${idx - 1} --> ${nodeId}\n`;
			}
		});

		// Add conclusion
		diagram += `    conclusion["✓ ${steps[steps.length - 1]?.conclusion || 'Conclusion'}"]:::highlight\n`;
		diagram += `    step${steps.length - 1} --> conclusion\n`;
		diagram += '    classDef highlight fill:#90EE90,stroke:#2E7D32,stroke-width:3px\n';

		return diagram;
	}

	/**
	 * Generate visualization for multi-agent system
	 */
	static visualizeAgentNetwork(agents: Array<{ name: string; type: string; connections?: string[] }>): string {
		let diagram = 'graph TB\n';

		// Add agents as nodes
		agents.forEach((agent, idx) => {
			const nodeId = `agent${idx}`;
			const icon = this.getAgentIcon(agent.type);
			const label = `${icon} ${agent.name}\\n(${agent.type})`;
			const style = this.getAgentStyle(agent.type);
			diagram += `    ${nodeId}["${label}"]${style}\n`;
		});

		// Add connections
		agents.forEach((agent, idx) => {
			if (agent.connections && Array.isArray(agent.connections)) {
				agent.connections.forEach((targetName) => {
					const targetIdx = agents.findIndex((a) => a.name === targetName);
					if (targetIdx >= 0) {
						diagram += `    agent${idx} <--> agent${targetIdx}\n`;
					}
				});
			}
		});

		// Add shared knowledge base
		diagram += '    kb[("🧠 Shared\\nKnowledge Base")]:::kb\n';
		agents.forEach((_, idx) => {
			diagram += `    agent${idx} -.-> kb\n`;
		});

		diagram += '    classDef kb fill:#FFE082,stroke:#F57C00,stroke-width:2px\n';

		return diagram;
	}

	/**
	 * Generate visualization for pattern mining results
	 */
	static visualizePatterns(patterns: Array<{ pattern: string; support: number; confidence?: number }>): string {
		let diagram = 'graph LR\n';
		diagram += '    start([Input Data])\n';

		patterns.forEach((pattern, idx) => {
			const nodeId = `pattern${idx}`;
			const confidence = pattern.confidence ? ` (${(pattern.confidence * 100).toFixed(0)}%)` : '';
			const label = `${pattern.pattern}\\nSupport: ${(pattern.support * 100).toFixed(0)}%${confidence}`;
			const style = this.getPatternStyle(pattern.support);
			diagram += `    ${nodeId}["${label}"]${style}\n`;
			diagram += `    start --> ${nodeId}\n`;
		});

		return diagram;
	}

	/**
	 * Generate JSON structure for D3.js or other visualization libraries
	 */
	static generateGraphJSON(nodes: any[], edges: any[]): string {
		return JSON.stringify(
			{
				nodes: nodes.map((n, idx) => ({
					id: idx,
					label: n.label || n.name,
					type: n.type,
					...n,
				})),
				edges: edges.map((e) => ({
					source: e.source,
					target: e.target,
					type: e.type || 'default',
					...e,
				})),
			},
			null,
			2,
		);
	}

	/**
	 * Create performance metrics visualization
	 */
	static visualizePerformanceMetrics(metrics: {
		reasoningTime?: number;
		patternMiningTime?: number;
		agentProcessingTime?: number;
		memoryUsage?: number;
	}): string {
		let diagram = 'graph TD\n';
		diagram += '    metrics[Performance Metrics]\n';

		if (metrics.reasoningTime) {
			diagram += `    reasoning["⏱️ Reasoning: ${metrics.reasoningTime}ms"]\n`;
			diagram += '    metrics --> reasoning\n';
		}

		if (metrics.patternMiningTime) {
			diagram += `    mining["⛏️ Pattern Mining: ${metrics.patternMiningTime}ms"]\n`;
			diagram += '    metrics --> mining\n';
		}

		if (metrics.agentProcessingTime) {
			diagram += `    agent["🤖 Agent Processing: ${metrics.agentProcessingTime}ms"]\n`;
			diagram += '    metrics --> agent\n';
		}

		if (metrics.memoryUsage) {
			diagram += `    memory["💾 Memory: ${metrics.memoryUsage}MB"]\n`;
			diagram += '    metrics --> memory\n';
		}

		return diagram;
	}

	/**
	 * Helper: Get node style based on atom type
	 */
	private static getNodeStyle(type: string): string {
		const styles: Record<string, string> = {
			ConceptNode: ':::concept',
			PredicateNode: ':::predicate',
			InheritanceLink: ':::link',
			SimilarityLink: ':::link',
		};
		return styles[type] || '';
	}

	/**
	 * Helper: Get agent icon based on type
	 */
	private static getAgentIcon(type: string): string {
		const icons: Record<string, string> = {
			general: '🤖',
			goalOriented: '🎯',
			reactive: '⚡',
			learning: '🧠',
			social: '👥',
			emotional: '❤️',
		};
		return icons[type] || '🤖';
	}

	/**
	 * Helper: Get agent style based on type
	 */
	private static getAgentStyle(type: string): string {
		const styles: Record<string, string> = {
			general: ':::general',
			goalOriented: ':::goal',
			reactive: ':::reactive',
			learning: ':::learning',
			social: ':::social',
			emotional: ':::emotional',
		};
		return styles[type] || '';
	}

	/**
	 * Helper: Get pattern style based on support value
	 */
	private static getPatternStyle(support: number): string {
		if (support >= 0.7) return ':::highSupport';
		if (support >= 0.4) return ':::mediumSupport';
		return ':::lowSupport';
	}

	/**
	 * Generate complete workflow visualization
	 */
	static visualizeCompleteWorkflow(workflow: {
		atoms?: any[];
		reasoning?: any[];
		agents?: any[];
		patterns?: any[];
	}): string {
		let diagram = 'graph TB\n';
		diagram += '    subgraph Knowledge["Knowledge Layer"]\n';

		if (workflow.atoms) {
			diagram += '        atomspace["🔵 AtomSpace\\nKnowledge Base"]\n';
		}

		diagram += '    end\n';
		diagram += '    subgraph Processing["Processing Layer"]\n';

		if (workflow.reasoning) {
			diagram += '        reasoning["🟣 Reasoning Engine\\nInference"]\n';
		}

		if (workflow.patterns) {
			diagram += '        mining["🟠 Pattern Miner\\nDiscovery"]\n';
		}

		diagram += '    end\n';
		diagram += '    subgraph Agent["Agent Layer"]\n';

		if (workflow.agents) {
			workflow.agents.forEach((agent: any, idx: number) => {
				diagram += `        agent${idx}["🔴 ${agent.name}"]\n`;
			});
		}

		diagram += '    end\n';

		// Add connections
		if (workflow.atoms && workflow.reasoning) {
			diagram += '    atomspace --> reasoning\n';
		}
		if (workflow.reasoning && workflow.agents) {
			workflow.agents.forEach((_: any, idx: number) => {
				diagram += `    reasoning --> agent${idx}\n`;
			});
		}
		if (workflow.patterns) {
			diagram += '    atomspace --> mining\n';
			diagram += '    mining --> reasoning\n';
		}

		return diagram;
	}
}

/**
 * Example usage in n8n node:
 *
 * // Visualize AtomSpace
 * const atoms = [
 *   { type: 'ConceptNode', name: 'Human', links: ['Animal'] },
 *   { type: 'ConceptNode', name: 'Animal', links: ['Living'] },
 *   { type: 'ConceptNode', name: 'Living' }
 * ];
 * const diagram = CognitiveVisualizer.visualizeAtomSpace(atoms);
 *
 * // Visualize reasoning chain
 * const steps = [
 *   { step: 1, rule: 'If X isa Y', conclusion: 'Intermediate' },
 *   { step: 2, rule: 'And Y isa Z', conclusion: 'Then X isa Z' }
 * ];
 * const reasoning = CognitiveVisualizer.visualizeReasoningChain(steps);
 */
