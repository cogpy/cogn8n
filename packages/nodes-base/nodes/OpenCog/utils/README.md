# OpenCog Utilities

This directory contains utility classes and helpers for working with OpenCog cognitive automation nodes in cogn8n.

## Available Utilities

### NaturalLanguageQuery.ts

**Purpose**: Translate natural language queries into AtomSpace query patterns

**Features**:
- Parse common query patterns (What is X?, Is X a Y?, etc.)
- Generate OpenCog-style query expressions
- Context-aware query enhancement
- Pattern validation

**Usage**:
```typescript
import { NaturalLanguageQueryParser } from './utils/NaturalLanguageQuery';

const result = NaturalLanguageQueryParser.parse("What is human?");
console.log(result.pattern); // AtomSpace query pattern
console.log(result.interpretation); // Human-readable explanation
console.log(result.confidence); // Confidence score (0-1)
```

**Supported Query Patterns**:
- "What is X?" - Find relationships
- "Is X a Y?" - Check inheritance
- "What are the properties of X?" - Find properties
- "Find all X that Y" - Conditional search
- "How is X related to Y?" - Find relationships
- "Show me X" - Retrieve information
- "List all X" - List all instances

### CognitiveVisualizer.ts

**Purpose**: Generate visualizations of cognitive workflow components

**Features**:
- AtomSpace graph visualization
- Reasoning chain diagrams
- Multi-agent network visualization
- Pattern mining result charts
- Performance metrics display
- Mermaid diagram generation

**Usage**:
```typescript
import { CognitiveVisualizer } from './utils/CognitiveVisualizer';

// Visualize AtomSpace
const atoms = [
  { type: 'ConceptNode', name: 'Human', links: ['Animal'] },
  { type: 'ConceptNode', name: 'Animal', links: ['Living'] }
];
const diagram = CognitiveVisualizer.visualizeAtomSpace(atoms);

// Visualize reasoning chain
const steps = [
  { step: 1, rule: 'If X isa Y', conclusion: 'Intermediate' },
  { step: 2, rule: 'And Y isa Z', conclusion: 'Then X isa Z' }
];
const reasoning = CognitiveVisualizer.visualizeReasoningChain(steps);
```

**Visualization Types**:
- `visualizeAtomSpace()` - Knowledge graph structure
- `visualizeReasoningChain()` - Step-by-step inference
- `visualizeAgentNetwork()` - Multi-agent interactions
- `visualizePatterns()` - Pattern mining results
- `visualizeCompleteWorkflow()` - Full workflow overview

### PerformanceBenchmark.ts

**Purpose**: Benchmark and monitor cognitive operation performance

**Features**:
- Operation benchmarking with timing and memory tracking
- Aggregate performance metrics
- Performance report generation
- CSV and JSON export
- Detailed profiling support

**Usage**:
```typescript
import { CognitiveBenchmark, CognitiveProfiler } from './utils/PerformanceBenchmark';

// Benchmark operations
const benchmark = new CognitiveBenchmark();

const { result, benchmark: metrics } = await benchmark.benchmark(
  'AtomSpace.addAtom',
  async () => await atomSpace.addAtom(...),
  100 // number of items processed
);

console.log(metrics.executionTime); // milliseconds
console.log(metrics.throughput); // items per second
console.log(metrics.memoryUsed); // bytes

// Generate report
console.log(benchmark.generateReport());

// Detailed profiling
const profiler = new CognitiveProfiler();
const end = profiler.start('complexOperation');
// ... perform operation
end({ itemsProcessed: 50 });
const profile = profiler.getProfile('complexOperation');
```

**Metrics Tracked**:
- Execution time (ms)
- Memory usage (bytes)
- Items processed
- Throughput (items/sec)
- Min/Max/Average values

## Integration with Nodes

These utilities can be integrated into OpenCog nodes to enhance their functionality:

### Example: Adding NL Query to AtomSpace Node

```typescript
import { NaturalLanguageQueryParser } from '../utils/NaturalLanguageQuery';

// In AtomSpace node execute method
if (operation === 'queryNaturalLanguage') {
  const nlQuery = this.getNodeParameter('naturalLanguageQuery', i) as string;
  const queryResult = NaturalLanguageQueryParser.parse(nlQuery);
  
  // Use the generated pattern for AtomSpace query
  const results = await atomSpace.query(queryResult.pattern);
  
  returnData.push({
    json: {
      query: nlQuery,
      interpretation: queryResult.interpretation,
      confidence: queryResult.confidence,
      results
    }
  });
}
```

### Example: Adding Visualization to Agent Node

```typescript
import { CognitiveVisualizer } from '../utils/CognitiveVisualizer';

// In CognitiveAgent node execute method
if (this.getNodeParameter('includeVisualization', i, false)) {
  const agentData = {
    name: agentName,
    type: agentType,
    connections: agentConnections
  };
  
  const visualization = CognitiveVisualizer.visualizeAgentNetwork([agentData]);
  
  returnData.push({
    json: {
      ...agentResult,
      visualization
    }
  });
}
```

### Example: Adding Benchmarking to Reasoning Node

```typescript
import { CognitiveBenchmark } from '../utils/PerformanceBenchmark';

// In ReasoningEngine node
const benchmark = new CognitiveBenchmark();

const { result: reasoningResult, benchmark: metrics } = await benchmark.benchmark(
  `ReasoningEngine.${reasoningType}`,
  async () => await this.performReasoning(inputKnowledge, params),
  1
);

returnData.push({
  json: {
    ...reasoningResult,
    performance: {
      executionTime: metrics.executionTime,
      throughput: metrics.throughput
    }
  }
});
```

## Development Guidelines

### Adding New Utilities

1. Create a new TypeScript file in this directory
2. Follow the naming convention: PascalCase for files and classes
3. Export classes and interfaces for external use
4. Include comprehensive JSDoc comments
5. Provide usage examples in comments
6. Update this README with documentation

### Testing Utilities

Create test files in a `test/` subdirectory:

```typescript
// test/NaturalLanguageQuery.test.ts
import { NaturalLanguageQueryParser } from '../NaturalLanguageQuery';

describe('NaturalLanguageQueryParser', () => {
  it('should parse "What is X?" queries', () => {
    const result = NaturalLanguageQueryParser.parse('What is human?');
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.pattern).toContain('Inheritance');
  });
});
```

### Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable names
- Keep functions focused and single-purpose
- Include error handling where appropriate
- Document public APIs with JSDoc

## Future Enhancements

Planned utility additions:

1. **AtomSpaceSerializer**: Import/export AtomSpace in various formats (JSON, Scheme, etc.)
2. **ReasoningOptimizer**: Optimize reasoning chains for performance
3. **AgentCoordinator**: Advanced multi-agent coordination patterns
4. **PatternValidator**: Validate and sanitize pattern configurations
5. **CognitiveCache**: Caching layer for frequently accessed data
6. **MetricsCollector**: Comprehensive telemetry and monitoring
7. **WorkflowBuilder**: Programmatic workflow construction helpers
8. **KnowledgeImporter**: Import knowledge from external sources

## Contributing

When contributing utilities:

1. Ensure backward compatibility
2. Write comprehensive tests
3. Update documentation
4. Follow the existing code style
5. Consider performance implications
6. Add examples to this README

## License

These utilities are part of the cogn8n project and follow the same license as the main project.
