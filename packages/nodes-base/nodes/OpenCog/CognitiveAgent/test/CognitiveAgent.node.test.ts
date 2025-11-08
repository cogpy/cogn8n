import type { IExecuteFunctions } from 'n8n-workflow';
import { CognitiveAgent } from '../CognitiveAgent.node';

describe('CognitiveAgent Node', () => {
	let cognitiveAgent: CognitiveAgent;
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		cognitiveAgent = new CognitiveAgent();
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn(),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;
	});

	// Helper function to create merged context for execute
	const createContext = () => {
		const context = Object.create(cognitiveAgent);
		Object.assign(context, mockExecuteFunctions);
		return context;
	};

	describe('Node Properties', () => {
		test('should have correct node properties', () => {
			expect(cognitiveAgent.description.name).toBe('cognitiveAgent');
			expect(cognitiveAgent.description.displayName).toBe('OpenCog Cognitive Agent');
			expect(cognitiveAgent.description.group).toContain('transform');
		});

		test('should have all agent types', () => {
			const agentType = cognitiveAgent.description.properties.find(p => p.name === 'agentType');
			expect(agentType).toBeDefined();
			
			const agentOptions = agentType?.options as Array<{ value: string }>;
			const agentTypes = agentOptions.map(op => op.value);
			
			expect(agentTypes).toContain('generalPurpose');
			expect(agentTypes).toContain('goalOriented');
			expect(agentTypes).toContain('reactive');
			expect(agentTypes).toContain('learning');
			expect(agentTypes).toContain('social');
			expect(agentTypes).toContain('emotional');
		});
	});

	describe('General Purpose Agent', () => {
		test('should process general purpose agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('generalPurpose') // agentType
				.mockReturnValueOnce('TestAgent') // agentName
				.mockReturnValueOnce('Test stimulus') // inputStimulus
				.mockReturnValueOnce({ values: { attentionThreshold: 0.5 } }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('generalPurpose');
			expect(output.agentName).toBe('TestAgent');
			expect(output.cognitiveState).toBeDefined();
			expect(output.actions).toBeDefined();
			expect(Array.isArray(output.actions)).toBe(true);
		});
	});

	describe('Goal-Oriented Agent', () => {
		test('should process goal-oriented agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('goalOriented') // agentType
				.mockReturnValueOnce('PlannerAgent') // agentName  
				.mockReturnValueOnce('Planning task') // inputStimulus
				.mockReturnValueOnce('Goal 1\nGoal 2\nGoal 3') // goals
				.mockReturnValueOnce({ values: {} }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('goalOriented');
			expect(output.goals).toHaveLength(3);
			expect(output.goalPlanning).toBeDefined();
			expect(output.goalPlanning.activeGoals).toBeDefined();
			expect(output.goalPlanning.plannedActions).toBeDefined();
		});
	});

	describe('Learning Agent', () => {
		test('should process learning agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('learning') // agentType
				.mockReturnValueOnce('LearningAgent') // agentName
				.mockReturnValueOnce('Learning data') // inputStimulus
				.mockReturnValueOnce('Learn pattern X') // goals
				.mockReturnValueOnce({ values: { learningRate: 0.2 } }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('learning');
			expect(output.learningState).toBeDefined();
			expect(output.learningState.currentKnowledge).toBeDefined();
			expect(output.learningState.learningProgress).toBeDefined();
			expect(output.learningState.adaptations).toBeDefined();
		});
	});

	describe('Social Agent', () => {
		test('should process social agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('social') // agentType
				.mockReturnValueOnce('SocialAgent') // agentName
				.mockReturnValueOnce('Social interaction') // inputStimulus
				.mockReturnValueOnce('Agent1, Agent2, Agent3') // otherAgents
				.mockReturnValueOnce({ values: {} }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('social');
			expect(output.otherAgents).toHaveLength(3);
			expect(output.socialInteractions).toBeDefined();
			expect(output.socialState).toBeDefined();
			expect(output.socialState.relationships).toBeDefined();
		});
	});

	describe('Emotional Agent', () => {
		test('should process emotional agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('emotional') // agentType
				.mockReturnValueOnce('EmotionalAgent') // agentName
				.mockReturnValueOnce('Emotional stimulus') // inputStimulus
				.mockReturnValueOnce({ values: { emotionalSensitivity: 0.8 } }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('emotional');
			expect(output.emotionalState).toBeDefined();
			expect(output.emotionalState.currentEmotions).toBeDefined();
			expect(output.emotionalResponse).toBeDefined();
			expect(output.emotionalResponse.dominantEmotion).toBeDefined();
		});
	});

	describe('Reactive Agent', () => {
		test('should process reactive agent', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('reactive') // agentType
				.mockReturnValueOnce('ReactiveAgent') // agentName
				.mockReturnValueOnce('Urgent stimulus') // inputStimulus
				.mockReturnValueOnce({ values: {} }); // agentConfig

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.agentType).toBe('reactive');
			expect(output.availableReactions).toBeDefined();
			expect(output.selectedReaction).toBeDefined();
			expect(output.responseTime).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		test('should handle unknown agent type', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn()
				.mockReturnValueOnce('unknownType');
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			const result = await cognitiveAgent.execute.call(createContext());
			
			const output = result[0][0].json;
			expect(output.error).toContain('Unknown agent type');
		});
	});
});