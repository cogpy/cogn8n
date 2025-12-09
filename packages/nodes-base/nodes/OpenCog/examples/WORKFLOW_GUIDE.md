# OpenCog Workflow Examples

This directory contains example workflows demonstrating various OpenCog cognitive automation capabilities in cogn8n.

## Available Workflows

### 1. Cognitive Workflow Example (`cognitive-workflow-example.json`)

**Purpose**: Demonstrates a complete cognitive processing pipeline with all four OpenCog node types.

**What it does**:
- Adds semantic knowledge to AtomSpace (concepts and relationships)
- Mines patterns from the knowledge base
- Applies forward chaining reasoning
- Processes results through a learning agent

**Use cases**:
- Learning OpenCog basics
- Understanding node interactions
- Building foundational cognitive workflows

**Key nodes**:
- 2x AtomSpace nodes (knowledge input)
- 1x Pattern Miner node (pattern discovery)
- 1x Reasoning Engine node (inference)
- 1x Cognitive Agent node (learning)

---

### 2. Knowledge Discovery Pipeline (`knowledge-discovery-workflow.json`)

**Purpose**: Discovers patterns from raw data and stores them as structured knowledge.

**What it does**:
- Analyzes sample transactional data
- Finds frequent item patterns
- Discovers association rules
- Stores discovered knowledge in AtomSpace

**Use cases**:
- Market basket analysis
- Customer behavior analysis
- Product recommendation systems
- Pattern-based knowledge extraction

**Key nodes**:
- Data input (Set node)
- 2x Pattern Miner nodes (frequent patterns & associations)
- 2x AtomSpace nodes (storing concepts & relationships)

**Configuration tips**:
- Adjust `minSupport` based on data size (0.3-0.7 typical)
- Set `minConfidence` for association rules (0.6-0.8 typical)
- Use higher values for smaller, curated datasets

---

### 3. Multi-Agent Decision Making (`multi-agent-decision-workflow.json`)

**Purpose**: Demonstrates coordinated decision making using multiple cognitive agents.

**What it does**:
- Goal-oriented agent evaluates strategic objectives
- Learning agent analyzes and learns from market data
- Social agent coordinates inputs and builds consensus
- Reasoning engine synthesizes final decision
- Outputs unified decision with confidence level

**Use cases**:
- Strategic business decisions
- Complex problem solving
- Multi-perspective analysis
- Collaborative AI systems

**Key nodes**:
- 3x Cognitive Agent nodes (different types)
- 1x Reasoning Engine node (abductive reasoning)
- Set nodes for input/output

**Configuration tips**:
- Higher `attentionThreshold` (0.7+) for focused agents
- Lower `learningRate` (0.15-0.25) for stable learning
- Adjust `memoryCapacity` based on decision complexity

---

### 4. Anomaly Detection and Analysis (`anomaly-detection-workflow.json`)

**Purpose**: Detects anomalies in data streams and performs causal analysis.

**What it does**:
- Monitors system metrics (CPU, memory, response times)
- Detects anomalous patterns
- Performs causal pattern analysis
- Applies temporal reasoning
- Reactive agent provides immediate response
- Learning agent adapts detection model
- Stores anomaly knowledge for future reference

**Use cases**:
- System monitoring and alerting
- Quality control and defect detection
- Fraud detection
- Network security monitoring
- Predictive maintenance

**Key nodes**:
- 2x Pattern Miner nodes (anomaly detection & causal analysis)
- 1x Reasoning Engine node (temporal reasoning)
- 2x Cognitive Agent nodes (reactive & learning)
- 1x AtomSpace node (knowledge storage)

**Configuration tips**:
- Set `anomalyThreshold` (0.8-0.95) based on sensitivity needs
- Higher threshold = fewer false positives, may miss some anomalies
- Lower threshold = more sensitive, may increase false positives
- Adjust `windowSize` for temporal patterns (3-10 typical)

---

### 5. Multi-Agent Collaboration (`multi-agent-collaboration.json`)

**Purpose**: Demonstrates multiple cognitive agents working together to solve complex problems through coordination and knowledge sharing.

**What it does**:
- Creates a shared knowledge base for agent collaboration
- Deploys specialized agents (goal-oriented, learning, social, emotional)
- Coordinates agent interactions through a social coordinator
- Processes collective intelligence through pattern discovery and reasoning
- Evaluates emotional context for improved decision-making

**Use cases**:
- Complex problem solving requiring multiple perspectives
- Collaborative decision-making systems
- Multi-agent simulation and modeling
- Distributed cognitive processing
- Team coordination and task allocation

**Key nodes**:
- 1x AtomSpace node (shared knowledge base)
- 4x Cognitive Agent nodes (goal-oriented, learning, social, emotional)
- 1x Pattern Miner node (collective pattern discovery)
- 1x Reasoning Engine node (synthesis of conclusions)

**Configuration tips**:
- Adjust agent parameters based on specialization needs
- Use social agents with higher attention thresholds for coordination
- Set learning agents with higher exploration factors
- Configure emotional agents with appropriate sensitivity

---

### 6. LangChain + OpenCog Hybrid AI (`langchain-opencog-integration.json`)

**Purpose**: Demonstrates integration of LangChain AI agents with OpenCog cognitive reasoning for hybrid symbolic-neural intelligence.

**What it does**:
- Receives queries via webhook for real-time processing
- Stores knowledge in AtomSpace for symbolic representation
- Analyzes patterns using association rule mining
- Applies analogical reasoning for insights
- Processes through cognitive agent combining symbolic and neural approaches
- Returns structured responses with integrated intelligence

**Use cases**:
- Hybrid AI systems combining neural and symbolic reasoning
- Natural language understanding with structured knowledge
- Conversational AI with cognitive reasoning capabilities
- Knowledge-augmented language models
- Semantic search and question answering

**Key nodes**:
- 1x Webhook trigger (input)
- 1x Set node (data extraction)
- 1x AtomSpace node (knowledge storage)
- 1x Pattern Miner node (association analysis)
- 1x Reasoning Engine node (analogical reasoning)
- 1x Cognitive Agent node (hybrid processing)
- 1x Respond to Webhook node (output)

**Configuration tips**:
- Use analogical reasoning for cross-domain knowledge transfer
- Set appropriate confidence thresholds for reasoning (0.65+)
- Configure cognitive agent with balanced learning/exploration
- Optimize for real-time response requirements

---

## How to Use These Workflows

### Importing Workflows

1. Open cogn8n web interface
2. Click **Workflows** → **Import from File**
3. Select one of the JSON files from this directory
4. Click **Import**

### Testing Workflows

1. Open the imported workflow
2. Review node configurations
3. Click **Execute Workflow** button
4. Observe outputs at each node
5. Modify parameters and re-execute

### Customizing Workflows

#### Modifying Data Sources

Replace the `Set` nodes with actual data sources:
- **HTTP Request** nodes for API data
- **Database** nodes for SQL data
- **File** nodes for CSV/JSON data
- **Webhook** nodes for real-time data

#### Adjusting Parameters

Common parameters to customize:

**AtomSpace:**
- `atomType`: Choose appropriate node/link type
- `truthValue.strength`: How strongly you believe (0-1)
- `truthValue.confidence`: How certain you are (0-1)

**Pattern Miner:**
- `minSupport`: Frequency threshold (0-1)
- `minConfidence`: Confidence threshold for rules (0-1)
- `anomalyThreshold`: Sensitivity for anomaly detection (0-1)
- `windowSize`: Temporal window for sequential patterns

**Reasoning Engine:**
- `maxSteps`: Maximum inference steps (3-10 typical)
- `confidenceThreshold`: Minimum confidence for conclusions (0-1)
- `maxResults`: Number of results to return

**Cognitive Agent:**
- `attentionThreshold`: Focus level (0-1)
- `learningRate`: Learning speed (0.1-0.3)
- `memoryCapacity`: Memory size (1000-10000)
- `explorationFactor`: Exploration vs exploitation (0-1)

#### Combining Workflows

You can combine patterns from different workflows:

1. **Knowledge Discovery → Multi-Agent Decision**: Use discovered patterns as input for agent-based decisions
2. **Anomaly Detection → Learning Agent**: Feed anomalies to learning agents for adaptive improvement
3. **Pattern Mining → Reasoning**: Use mined patterns as input knowledge for reasoning engines

---

## Workflow Patterns

### Pattern: Sequential Processing

```
Input → Process A → Process B → Process C → Output
```

Each node processes data from the previous node in sequence.

**Example**: cognitive-workflow-example.json

### Pattern: Parallel Processing

```
        ┌→ Process A →┐
Input →─┤             ├→ Aggregation → Output
        └→ Process B →┘
```

Multiple nodes process the same input simultaneously, results are combined.

**Example**: anomaly-detection-workflow.json (reactive + learning agents)

### Pattern: Branching Logic

```
             ┌→ Branch A → Output A
Input → Logic├→ Branch B → Output B
             └→ Branch C → Output C
```

Logic determines which processing path to follow.

**Implementation**: Use n8n's **IF** or **Switch** nodes with OpenCog nodes

### Pattern: Iterative Refinement

```
Input → Process → Evaluate → [Loop back if needed] → Output
```

Results are refined through multiple iterations.

**Implementation**: Combine learning agents with feedback loops

---

## Performance Optimization

### For Large Datasets

1. **Reduce pattern mining parameters**:
   - Increase `minSupport` (0.5-0.7)
   - Decrease `maxPatternLength` (2-3)

2. **Limit reasoning steps**:
   - Set `maxSteps` to 3-5
   - Use lower `maxResults` (5-10)

3. **Optimize agent configuration**:
   - Reduce `memoryCapacity` (1000-3000)
   - Increase `attentionThreshold` (0.7-0.8)

### For Real-Time Processing

1. Use **Reactive Agent** type for quick responses
2. Set shorter `windowSize` for pattern mining (3-5)
3. Enable workflow error handling for resilience
4. Consider batch processing for non-critical paths

### For Complex Reasoning

1. Increase `maxSteps` (10-20) for deeper inference
2. Use **Backward Chaining** for goal-directed reasoning
3. Combine multiple reasoning types in sequence
4. Store intermediate results in AtomSpace

---

## Troubleshooting

### Workflow doesn't execute

- Check all nodes are properly connected
- Verify required parameters are filled
- Review error messages in execution log
- Ensure data format matches node expectations

### Poor quality results

- Adjust confidence/threshold parameters
- Increase truth value strength for input knowledge
- Use more relevant training data
- Verify data preprocessing is correct

### Slow performance

- Reduce max steps/results parameters
- Process data in smaller batches
- Use parallel processing where possible
- Optimize agent memory settings

---

## Next Steps

1. **Start Simple**: Begin with `cognitive-workflow-example.json`
2. **Experiment**: Modify parameters and observe effects
3. **Combine**: Mix patterns from different workflows
4. **Build Custom**: Create workflows for your specific use cases
5. **Share**: Contribute your workflows back to the community

## Additional Resources

- [Getting Started Guide](GETTING_STARTED.md)
- [OpenCog Integration Documentation](../OPENCOG_INTEGRATION.md)
- [Architecture Diagrams](../../../../COGNITIVE_ARCHITECTURE_DIAGRAM.md)
- [Node Documentation](README.md)

---

**Happy Workflow Building! 🚀🧠**
