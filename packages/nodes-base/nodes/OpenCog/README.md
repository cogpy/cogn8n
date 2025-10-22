# OpenCog Integration for n8n

This package provides OpenCog cognitive automation capabilities for n8n workflows, enabling advanced cognitive processes including knowledge representation, reasoning, pattern mining, and autonomous agent behavior.

## Overview

OpenCog is an open-source artificial general intelligence (AGI) framework that provides a comprehensive cognitive architecture. This integration brings OpenCog's powerful cognitive capabilities to n8n workflows, allowing for:

- **Semantic Knowledge Representation** via AtomSpace
- **Advanced Reasoning** with multiple inference engines
- **Cognitive Pattern Mining** for knowledge discovery  
- **Autonomous Cognitive Agents** with learning and adaptation
- **Multi-agent Coordination** and social cognition

## Available Nodes

### 1. AtomSpace Node (`atomSpace`)

The AtomSpace is OpenCog's hypergraph-based knowledge representation system that stores semantic relationships between concepts, entities, and their properties.

**Operations:**
- **Add Atom**: Create new atoms (concepts, predicates, links)
- **Query Atoms**: Search and retrieve atoms by name or pattern
- **Pattern Match**: Complex pattern matching using OpenCog syntax
- **Get/Set Truth Value**: Manage probabilistic truth values for uncertainty handling

**Use Cases:**
- Knowledge base construction
- Semantic relationship modeling
- Fact storage with uncertainty
- Hierarchical concept organization

### 2. Reasoning Engine Node (`reasoningEngine`)

Provides multiple cognitive reasoning capabilities for inference and decision-making.

**Reasoning Types:**
- **Forward Chaining**: Derive conclusions from premises
- **Backward Chaining**: Prove goals by working backward from conclusions  
- **Abductive Reasoning**: Infer best explanations for observations
- **Analogical Reasoning**: Reasoning by similarity and analogy
- **Probabilistic Reasoning**: Handle uncertainty with probabilistic inference
- **Temporal Reasoning**: Reason about time-based relationships

**Use Cases:**
- Automated decision making
- Hypothesis generation
- Causal inference
- Time-series analysis
- Uncertainty quantification

### 3. Cognitive Agent Node (`cognitiveAgent`)

Creates autonomous cognitive agents with different behavioral patterns and capabilities.

**Agent Types:**
- **General Purpose**: Basic cognitive processing
- **Goal-Oriented**: Focus on achieving specific objectives
- **Reactive**: Quick response to environmental stimuli  
- **Learning**: Adapt behavior based on experience
- **Social**: Multi-agent interaction and coordination
- **Emotional**: Emotional processing and responses

**Features:**
- Attention allocation mechanisms
- Memory management with configurable capacity
- Learning rate adjustment
- Exploration vs exploitation balance
- Emotional sensitivity control

### 4. Pattern Miner Node (`patternMiner`)

Advanced pattern recognition and knowledge discovery capabilities.

**Mining Types:**
- **Frequent Patterns**: Find commonly occurring item combinations
- **Association Rules**: Discover "if-then" relationships
- **Sequential Patterns**: Temporal pattern detection
- **Causal Patterns**: Identify cause-effect relationships
- **Anomaly Detection**: Find outliers and unusual patterns
- **Concept Formation**: Cluster patterns into new concepts

**Use Cases:**
- Data mining and analysis
- Behavior pattern recognition
- Predictive modeling
- Quality control and monitoring
- Knowledge discovery from data

## Example Workflow

The included example workflow demonstrates a complete cognitive processing pipeline:

1. **Knowledge Input**: Add concepts and relationships to AtomSpace
2. **Pattern Mining**: Discover frequent patterns in the knowledge base
3. **Reasoning**: Apply forward chaining to derive new knowledge
4. **Agent Processing**: Learning agent adapts to new information
5. **Multi-Agent Coordination**: Social agents coordinate actions

## Configuration

### Truth Values
All atoms in OpenCog have associated truth values representing:
- **Strength**: Confidence level (0.0 - 1.0)
- **Confidence**: Certainty in the strength value (0.0 - 1.0)

### Agent Configuration
Cognitive agents can be configured with:
- **Attention Threshold**: Focus allocation sensitivity
- **Learning Rate**: Speed of adaptation (learning agents)
- **Memory Capacity**: Maximum retained memories
- **Exploration Factor**: Balance between exploration and exploitation
- **Emotional Sensitivity**: Response to emotional stimuli (emotional agents)

### Pattern Mining Parameters
- **Minimum Support**: Frequency threshold for pattern discovery
- **Minimum Confidence**: Confidence threshold for association rules
- **Window Size**: Temporal window for sequential/causal patterns
- **Anomaly Threshold**: Percentile threshold for anomaly detection

## Integration with Existing n8n Nodes

OpenCog nodes work seamlessly with existing n8n nodes:

- **Data Sources**: Import data from APIs, databases, files
- **LangChain Nodes**: Combine with AI agents and language models  
- **Processing Nodes**: Use standard n8n nodes for data transformation
- **Output Nodes**: Export results to various destinations

## Advanced Use Cases

### 1. Intelligent Document Processing
```
Document Input → Text Analysis → Concept Extraction → AtomSpace Storage → 
Pattern Mining → Reasoning → Knowledge Synthesis → Report Generation
```

### 2. Multi-Agent System Orchestration  
```
Goal Definition → Agent Creation → Task Allocation → Social Coordination → 
Emotional Processing → Learning Adaptation → Performance Optimization
```

### 3. Predictive Analytics Pipeline
```  
Historical Data → Pattern Mining → Causal Analysis → Temporal Reasoning → 
Anomaly Detection → Prediction Generation → Decision Support
```

### 4. Cognitive Chatbot Enhancement
```
User Input → AtomSpace Query → Reasoning Chain → Agent Response → 
Emotional Context → Learning Update → Response Optimization
```

## Technical Architecture

The OpenCog integration follows n8n's node architecture patterns:

- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Error Handling**: Comprehensive error handling with graceful degradation  
- **Configuration**: Rich parameter configuration with validation
- **Documentation**: Inline help and examples for all parameters
- **Testing**: Comprehensive test coverage for all node operations

## Future Enhancements

Planned enhancements include:

1. **Real OpenCog Backend**: Integration with actual OpenCog server instances
2. **Visual AtomSpace**: Graphical representation of knowledge structures
3. **Advanced Learning**: More sophisticated machine learning integration
4. **Distributed Cognition**: Multi-node distributed cognitive processing
5. **Natural Language Interface**: Direct natural language interaction with AtomSpace

## Contributing

This OpenCog integration is part of the cogn8n project. Contributions are welcome for:

- Additional reasoning algorithms
- New agent behaviors and types
- Enhanced pattern mining capabilities  
- Performance optimizations
- Documentation improvements

## License

This integration follows the same licensing as the parent n8n project.