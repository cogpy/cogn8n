# OpenCog Integration Testing

This directory contains integration tests for OpenCog cognitive workflows. These tests verify that multiple nodes work together correctly in complete workflows.

## Test Framework

The `WorkflowTestFramework.ts` provides a comprehensive testing infrastructure for cognitive workflows:

### Features

- **Workflow Simulation**: Execute complete workflows with multiple nodes
- **Output Validation**: Verify output structure, item counts, and custom assertions
- **Performance Tracking**: Measure execution time for each test
- **Report Generation**: Create detailed test reports
- **Predefined Test Cases**: Standard test cases for common patterns

### Running Tests

```typescript
import { WorkflowTestRunner, STANDARD_TEST_CASES } from './WorkflowTestFramework';

// Create test runner
const runner = new WorkflowTestRunner();

// Run all standard tests
const results = await runner.runTests(STANDARD_TEST_CASES);

// Generate report
console.log(runner.generateReport());

// Check individual results
results.forEach(result => {
  console.log(`${result.testCase}: ${result.passed ? 'PASS' : 'FAIL'}`);
});
```

### Creating Custom Tests

```typescript
import { createTestCase, WorkflowTestRunner } from './WorkflowTestFramework';

const customTest = createTestCase(
  'Custom Cognitive Workflow',
  'Tests specific workflow pattern',
  [
    {
      name: 'AtomSpace',
      type: 'n8n-nodes-base.atomSpace',
      parameters: {
        operation: 'addAtom',
        atomType: 'ConceptNode',
        atomName: 'CustomConcept'
      }
    },
    {
      name: 'Reasoning',
      type: 'n8n-nodes-base.reasoningEngine',
      parameters: {
        reasoningType: 'forwardChaining'
      }
    }
  ],
  [{ json: { input: 'test data' } }], // Input data
  {
    itemCount: 1,
    assertions: [
      (output) => output[0].json !== undefined,
      (output) => 'processedBy' in output[0].json
    ]
  }
);

const runner = new WorkflowTestRunner();
const result = await runner.runTest(customTest);
```

## Standard Test Cases

The framework includes predefined test cases for common workflows:

### 1. Basic Knowledge Processing

Tests the basic cognitive pipeline:
```
AtomSpace → Pattern Mining → Reasoning
```

**Validates**:
- Knowledge representation and storage
- Pattern discovery from stored knowledge
- Reasoning based on discovered patterns

### 2. Multi-Agent Collaboration

Tests multiple agents working together:
```
Goal Agent → Learning Agent → Social Agent
```

**Validates**:
- Agent initialization and configuration
- Inter-agent data flow
- Collaborative problem solving

### 3. Complete Cognitive Pipeline

Tests the full cognitive automation stack:
```
AtomSpace → PatternMiner → Reasoning → Agent
```

**Validates**:
- End-to-end workflow execution
- Data transformation through pipeline
- Final agent processing and output

## Test Structure

### WorkflowTestCase Interface

```typescript
interface WorkflowTestCase {
  name: string;                    // Test case name
  description: string;             // Test description
  nodes: Array<{                   // Nodes in workflow
    name: string;
    type: string;
    parameters: Record<string, any>;
  }>;
  inputData: INodeExecutionData[]; // Input to workflow
  expectedOutput: {                // Expected results
    itemCount?: number;
    outputStructure?: Record<string, any>;
    assertions?: Array<(output: INodeExecutionData[]) => boolean>;
  };
}
```

### TestResult Interface

```typescript
interface TestResult {
  testCase: string;      // Test case name
  passed: boolean;       // Whether test passed
  executionTime: number; // Execution time in ms
  error?: string;        // Error message if failed
  output?: any;          // Test output data
}
```

## Validation Methods

### Item Count Validation

```typescript
expectedOutput: {
  itemCount: 3  // Expects exactly 3 output items
}
```

### Output Structure Validation

```typescript
expectedOutput: {
  outputStructure: {
    result: 'string',
    confidence: 'number'
  }
}
```

### Custom Assertions

```typescript
expectedOutput: {
  assertions: [
    (output) => output.length > 0,
    (output) => output[0].json.result !== undefined,
    (output) => output[0].json.confidence > 0.5
  ]
}
```

## Test Reports

The framework generates comprehensive test reports:

```markdown
# OpenCog Workflow Integration Test Report

Generated: 2024-10-22T12:00:00.000Z

## Summary

- Total Tests: 3
- Passed: 2 ✓
- Failed: 1 ✗
- Success Rate: 66.7%
- Average Execution Time: 45.23ms

## Test Results

### ✓ PASS - Basic Knowledge Processing
- Execution Time: 42.15ms

### ✓ PASS - Multi-Agent Collaboration
- Execution Time: 38.50ms

### ✗ FAIL - Complete Cognitive Pipeline
- Execution Time: 55.05ms
- Error: Expected 1 items, got 0
```

## Running Tests with Jest

Integration tests can be run with Jest:

```typescript
// integration.test.ts
import { WorkflowTestRunner, STANDARD_TEST_CASES } from './WorkflowTestFramework';

describe('OpenCog Integration Tests', () => {
  let runner: WorkflowTestRunner;

  beforeEach(() => {
    runner = new WorkflowTestRunner();
  });

  afterEach(() => {
    runner.clear();
  });

  test('should pass all standard test cases', async () => {
    const results = await runner.runTests(STANDARD_TEST_CASES);
    const allPassed = results.every(r => r.passed);
    expect(allPassed).toBe(true);
  });

  test('should execute basic knowledge processing', async () => {
    const testCase = STANDARD_TEST_CASES[0];
    const result = await runner.runTest(testCase);
    expect(result.passed).toBe(true);
    expect(result.executionTime).toBeLessThan(1000);
  });
});
```

## Best Practices

### 1. Test Independence

Ensure tests are independent and can run in any order:

```typescript
beforeEach(() => {
  runner = new WorkflowTestRunner();
  // Clear any shared state
});
```

### 2. Meaningful Assertions

Use specific assertions that validate actual functionality:

```typescript
assertions: [
  (output) => output[0].json.atoms !== undefined,
  (output) => output[0].json.atoms.length > 0,
  (output) => output[0].json.atoms[0].type === 'ConceptNode'
]
```

### 3. Performance Testing

Track execution times to identify performance issues:

```typescript
const result = await runner.runTest(testCase);
expect(result.executionTime).toBeLessThan(500); // Max 500ms
```

### 4. Error Scenarios

Test error handling and edge cases:

```typescript
const errorTest = createTestCase(
  'Error Handling',
  'Tests error scenarios',
  [...nodes],
  [{ json: { invalid: 'data' } }],
  {
    assertions: [
      (output) => output[0].json.error !== undefined
    ]
  }
);
```

## Extending the Framework

### Adding New Test Cases

1. Create a test case definition
2. Add to `STANDARD_TEST_CASES` or create a new collection
3. Document the test purpose and validation

### Custom Validation Logic

Extend the validation system:

```typescript
private validateOutput(output, expected) {
  // Add custom validation logic
  if (expected.customValidator) {
    return expected.customValidator(output);
  }
  // ... existing validation
}
```

### Mocking Node Execution

Replace mock execution with actual node execution:

```typescript
private async executeNode(node, inputData) {
  // Load actual node implementation
  const NodeClass = require(`../${node.type}`);
  const nodeInstance = new NodeClass();
  
  // Execute node with proper context
  return await nodeInstance.execute.call(context, inputData);
}
```

## Continuous Integration

Integrate with CI/CD pipelines:

```yaml
# .github/workflows/integration-tests.yml
name: OpenCog Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run integration tests
        run: pnpm test:integration
```

## Troubleshooting

### Tests Failing

1. Check node implementation changes
2. Verify test data is valid
3. Review assertion logic
4. Check for timing issues

### Performance Issues

1. Profile individual nodes
2. Check for memory leaks
3. Optimize data structures
4. Consider parallel execution

### False Positives

1. Make assertions more specific
2. Add multiple validation points
3. Test edge cases
4. Verify actual node behavior

## Future Enhancements

Planned improvements:

1. **Parallel Test Execution**: Run tests concurrently
2. **Test Coverage Tracking**: Measure code coverage
3. **Visual Test Reports**: HTML/dashboard reporting
4. **Performance Regression Testing**: Track performance over time
5. **Mock Data Generation**: Automatic test data generation
6. **Snapshot Testing**: Compare output snapshots

## Contributing

When adding integration tests:

1. Follow existing patterns
2. Document test purpose clearly
3. Use meaningful test names
4. Include edge cases
5. Verify tests pass locally
6. Update this documentation

## License

Part of the cogn8n project, following the same license.
