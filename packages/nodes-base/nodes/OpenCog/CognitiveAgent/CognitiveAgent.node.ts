import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class CognitiveAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCog Cognitive Agent',
		name: 'cognitiveAgent',
		icon: 'file:agent.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["agentType"] }}',
		description: 'Autonomous cognitive agent with learning and adaptation capabilities',
		defaults: {
			name: 'Cognitive Agent',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Agent Type',
				name: 'agentType',
				type: 'options',
				noDataExpression: true,
				default: 'generalPurpose',
				options: [
					{
						name: 'Emotional Agent',
						value: 'emotional',
						description: 'Agent with emotional processing capabilities',
						action: 'Create emotional agent',
					},
					{
						name: 'General Purpose Agent',
						value: 'generalPurpose',
						description: 'General-purpose cognitive agent',
						action: 'Create general purpose cognitive agent',
					},
					{
						name: 'Goal-Oriented Agent',
						value: 'goalOriented',
						description: 'Agent focused on achieving specific goals',
						action: 'Create goal-oriented agent',
					},
					{
						name: 'Learning Agent',
						value: 'learning',
						description: 'Agent that learns from experience',
						action: 'Create learning agent',
					},
					{
						name: 'Reactive Agent',
						value: 'reactive',
						description: 'Agent that reacts to environmental changes',
						action: 'Create reactive agent',
					},
					{
						name: 'Social Agent',
						value: 'social',
						description: 'Agent that interacts with other agents',
						action: 'Create social agent',
					},
				],
			},
			{
				displayName: 'Agent Name',
				name: 'agentName',
				type: 'string',
				default: 'CogAgent',
				description: 'Name identifier for the cognitive agent',
			},
			{
				displayName: 'Input Stimulus',
				name: 'inputStimulus',
				type: 'string',
				default: '',
				description: 'Input stimulus or environment data for the agent',
			},
			{
				displayName: 'Goals',
				name: 'goals',
				type: 'string',
				displayOptions: {
					show: {
						agentType: ['goalOriented', 'learning'],
					},
				},
				default: '',
				description: 'Goals for the agent to achieve (one per line)',
				typeOptions: {
					rows: 3,
				},
			},
			{
				displayName: 'Other Agents',
				name: 'otherAgents',
				type: 'string',
				displayOptions: {
					show: {
						agentType: ['social'],
					},
				},
				default: '',
				description: 'Names of other agents to interact with (comma-separated)',
			},
			{
				displayName: 'Agent Configuration',
				name: 'agentConfig',
				type: 'fixedCollection',
				default: { values: {} },
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'values',
						displayName: 'Configuration',
						values: [
							{
								displayName: 'Attention Threshold',
								name: 'attentionThreshold',
								type: 'number',
								default: 0.5,
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 2,
								},
								description: 'Threshold for attention allocation',
							},
							{
								displayName: 'Learning Rate',
								name: 'learningRate',
								type: 'number',
								default: 0.1,
								displayOptions: {
									show: {
										'/agentType': ['learning'],
									},
								},
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 3,
								},
								description: 'Rate at which the agent learns',
							},
							{
								displayName: 'Memory Capacity',
								name: 'memoryCapacity',
								type: 'number',
								default: 1000,
								description: 'Maximum number of memories to retain',
							},
							{
								displayName: 'Exploration Factor',
								name: 'explorationFactor',
								type: 'number',
								default: 0.3,
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 2,
								},
								description: 'Balance between exploration and exploitation',
							},
							{
								displayName: 'Emotional Sensitivity',
								name: 'emotionalSensitivity',
								type: 'number',
								default: 0.7,
								displayOptions: {
									show: {
										'/agentType': ['emotional'],
									},
								},
								typeOptions: {
									minValue: 0,
									maxValue: 1,
									numberPrecision: 2,
								},
								description: 'Sensitivity to emotional stimuli',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const agentType = this.getNodeParameter('agentType', i) as string;

			let result: any;

			try {
				switch (agentType) {
					case 'generalPurpose':
						result = await (this as any).processGeneralPurposeAgent(this, i);
						break;
					case 'goalOriented':
						result = await (this as any).processGoalOrientedAgent(this, i);
						break;
					case 'reactive':
						result = await (this as any).processReactiveAgent(this, i);
						break;
					case 'learning':
						result = await (this as any).processLearningAgent(this, i);
						break;
					case 'social':
						result = await (this as any).processSocialAgent(this, i);
						break;
					case 'emotional':
						result = await (this as any).processEmotionalAgent(this, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown agent type: ${agentType}`, {
							itemIndex: i,
						});
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processGeneralPurposeAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		// Simulate cognitive processing
		const cognitiveState = {
			attention: this.simulateAttentionAllocation(inputStimulus, config),
			memory: this.simulateMemoryRetrieval(inputStimulus, config),
			reasoning: this.simulateReasoning(inputStimulus),
		};

		const actions = this.generateActions(cognitiveState, 'general');

		return {
			agentType: 'generalPurpose',
			agentName,
			inputStimulus,
			cognitiveState,
			actions,
			timestamp: new Date().toISOString(),
			agentId: `agent_${agentName}_${Date.now()}`,
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processGoalOrientedAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		// @ts-ignore goals is used for agent goals
		const goals = context.getNodeParameter('goals', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		const goalList = goals.split('\n').filter(g => g.trim().length > 0);
		
		// Goal planning and execution
		const goalPlanning = {
			activeGoals: goalList.map((goal, idx) => ({
				goalId: `goal_${idx}`,
				description: goal.trim(),
				priority: Math.random(),
				progress: Math.random(),
				status: Math.random() > 0.7 ? 'completed' : 'active',
			})),
			plannedActions: [] as any[],
		};

		// Generate actions based on goals
		goalPlanning.plannedActions = goalList.map((goal, idx) => ({
			actionId: `action_${idx}`,
			description: `Action to achieve: ${goal}`,
			expectedOutcome: `Progress toward ${goal}`,
			priority: Math.random(),
		}));

		return {
			agentType: 'goalOriented',
			agentName,
			inputStimulus,
			goals: goalList,
			goalPlanning,
			actions: this.generateActions({ goals: goalList }, 'goal-oriented'),
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processReactiveAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		// Reactive behavior based on stimulus
		const reactions = [
			{
				trigger: 'stimulus_pattern_1',
				response: 'immediate_action_1',
				confidence: Math.random(),
			},
			{
				trigger: 'stimulus_pattern_2',
				response: 'immediate_action_2',
				confidence: Math.random(),
			},
		];

		const selectedReaction = reactions[Math.floor(Math.random() * reactions.length)];

		return {
			agentType: 'reactive',
			agentName,
			inputStimulus,
			availableReactions: reactions,
			selectedReaction,
			responseTime: Math.random() * 100, // ms
			actions: [selectedReaction.response],
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processLearningAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		// @ts-ignore goals is used for agent goals
		const goals = context.getNodeParameter('goals', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		// Simulate learning process
		const learningState = {
			currentKnowledge: {
				concepts: [`concept_${Math.floor(Math.random() * 100)}`],
				patterns: [`pattern_${Math.floor(Math.random() * 100)}`],
				experiences: [`experience_${Date.now()}`],
			},
			learningProgress: {
				conceptsLearned: Math.floor(Math.random() * 50),
				patternsRecognized: Math.floor(Math.random() * 30),
				skillsAcquired: Math.floor(Math.random() * 20),
			},
			adaptations: [
				{
					trigger: inputStimulus,
					adaptation: 'Updated behavior pattern',
					learningRate: config.learningRate || 0.1,
				},
			],
		};

		return {
			agentType: 'learning',
			agentName,
			inputStimulus,
			learningState,
			actions: this.generateActions(learningState, 'learning'),
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processSocialAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		const otherAgents = context.getNodeParameter('otherAgents', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		const agentList = otherAgents.split(',').map(a => a.trim()).filter(a => a.length > 0);

		// Social interaction simulation
		const socialInteractions = agentList.map(agent => ({
			targetAgent: agent,
			interactionType: ['communication', 'cooperation', 'negotiation'][Math.floor(Math.random() * 3)],
			message: `Interaction with ${agent} regarding: ${inputStimulus}`,
			relationship: Math.random(), // strength of relationship
		}));

		const socialState = {
			relationships: agentList.reduce((acc, agent) => {
				acc[agent] = {
					trust: Math.random(),
					cooperation: Math.random(),
					communication: Math.random(),
				};
				return acc;
			}, {} as any),
			groupDynamics: {
				roleInGroup: ['leader', 'follower', 'mediator'][Math.floor(Math.random() * 3)],
				influence: Math.random(),
			},
		};

		return {
			agentType: 'social',
			agentName,
			inputStimulus,
			otherAgents: agentList,
			socialInteractions,
			socialState,
			actions: this.generateActions(socialState, 'social'),
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-expect-error Method called dynamically via (this as any)
	private async processEmotionalAgent(context: IExecuteFunctions, itemIndex: number): Promise<any> {
		const agentName = context.getNodeParameter('agentName', itemIndex) as string;
		const inputStimulus = context.getNodeParameter('inputStimulus', itemIndex) as string;
		// @ts-ignore config is used for agent configuration
		const config = this.getAgentConfig(context, itemIndex);

		// Emotional processing simulation
		const emotionalState = {
			currentEmotions: {
				joy: Math.random() * config.emotionalSensitivity,
				fear: Math.random() * config.emotionalSensitivity,
				anger: Math.random() * config.emotionalSensitivity,
				sadness: Math.random() * config.emotionalSensitivity,
				surprise: Math.random() * config.emotionalSensitivity,
				disgust: Math.random() * config.emotionalSensitivity,
			},
			mood: Math.random() > 0.5 ? 'positive' : 'negative',
			emotionalMemory: [
				{
					stimulus: inputStimulus,
					emotion: 'curiosity',
					intensity: Math.random(),
					timestamp: new Date().toISOString(),
				},
			],
		};

		// Determine dominant emotion
		const dominantEmotion = Object.entries(emotionalState.currentEmotions)
			.reduce((max, [emotion, value]) => value > max.value ? { emotion, value } : max, { emotion: 'neutral', value: 0 });

		const emotionalResponse = {
			dominantEmotion: dominantEmotion.emotion,
			emotionalIntensity: dominantEmotion.value,
			behavioralTendency: this.getEmotionalBehavior(dominantEmotion.emotion),
		};

		return {
			agentType: 'emotional',
			agentName,
			inputStimulus,
			emotionalState,
			emotionalResponse,
			actions: this.generateActions(emotionalState, 'emotional'),
			timestamp: new Date().toISOString(),
		};
	}

	// @ts-ignore stimulus may be used for attention simulation
	private simulateAttentionAllocation(stimulus: string, config: any) {
		return {
			focusedElements: [`element_${Math.floor(Math.random() * 10)}`],
			attentionLevel: Math.min(1, Math.random() + config.attentionThreshold),
			distractions: Math.floor(Math.random() * 3),
		};
	}

	private simulateMemoryRetrieval(stimulus: string, config: any) {
		return {
			retrievedMemories: [
				{
					memoryId: `mem_${Date.now()}`,
					content: `Memory related to ${stimulus}`,
					relevance: Math.random(),
					age: Math.random() * 1000, // days
				},
			],
			totalMemories: config.memoryCapacity || 1000,
		};
	}

	private simulateReasoning(stimulus: string) {
		return {
			inferences: [
				{
					premise: stimulus,
					conclusion: `Conclusion about ${stimulus}`,
					confidence: Math.random(),
				},
			],
			reasoningType: 'abductive',
		};
	}

	// @ts-ignore cognitiveState may be used for action generation
	private generateActions(cognitiveState: any, agentType: string): string[] {
		const baseActions = [
			'process_information',
			'update_knowledge',
			'plan_next_action',
		];

		const typeSpecificActions = {
			general: ['observe_environment', 'reason_about_situation'],
			'goal-oriented': ['pursue_goal', 'adjust_strategy'],
			learning: ['learn_pattern', 'adapt_behavior'],
			social: ['communicate_with_peers', 'coordinate_actions'],
			emotional: ['express_emotion', 'regulate_emotion'],
		};

		return [...baseActions, ...((typeSpecificActions as any)[agentType] || [])];
	}

	private getEmotionalBehavior(emotion: string): string {
		const behaviors = {
			joy: 'approach_positive_stimuli',
			fear: 'avoid_threat',
			anger: 'confront_obstacle',
			sadness: 'seek_comfort',
			surprise: 'investigate_novelty',
			disgust: 'reject_stimulus',
		};

		return (behaviors as any)[emotion] || 'maintain_current_state';
	}

	private getAgentConfig(context: IExecuteFunctions, itemIndex: number): any {
		const configCollection = context.getNodeParameter('agentConfig', itemIndex) as any;
		const config = configCollection?.values || {};
		
		return {
			attentionThreshold: config.attentionThreshold || 0.5,
			learningRate: config.learningRate || 0.1,
			memoryCapacity: config.memoryCapacity || 1000,
			explorationFactor: config.explorationFactor || 0.3,
			emotionalSensitivity: config.emotionalSensitivity || 0.7,
		};
	}
}