# E2E Testing Guide

This guide provides comprehensive documentation for the E2E testing suite in n8n.

## Overview

n8n uses a multi-layered testing approach:

1. **Unit Tests** - Jest/Vitest for isolated component testing
2. **Integration Tests** - Jest for backend integration with databases
3. **E2E Tests** - Playwright for full application testing
4. **Smoke Tests** - Binary validation tests for releases

## Test Structure

```
packages/
├── testing/
│   └── playwright/           # E2E test suite
│       ├── tests/
│       │   ├── e2e/          # Main E2E tests
│       │   ├── performance/  # Performance tests
│       │   ├── chaos/        # Chaos engineering tests
│       │   └── cli-workflows/# CLI workflow tests
│       ├── fixtures/         # Test fixtures
│       ├── pages/            # Page objects
│       └── composables/      # Shared test utilities
├── cli/
│   └── test/
│       ├── unit/             # CLI unit tests
│       ├── integration/      # CLI integration tests
│       └── smoke/            # Binary smoke tests
├── core/
│   └── src/__tests__/        # Core engine tests
└── frontend/
    └── editor-ui/
        └── src/**/*.test.ts  # Frontend unit tests
```

## Running Tests

### E2E Tests

```bash
# Run all E2E tests locally (SQLite)
pnpm --filter=n8n-playwright test:local

# Run specific test file
pnpm --filter=n8n-playwright test:local -- tests/e2e/auth/signin.spec.ts

# Run tests in development mode with UI
pnpm dev:e2e

# Run with headed browser
SHOW_BROWSER=true pnpm --filter=n8n-playwright test:local
```

### Unit Tests

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm test:ci:backend

# Run frontend tests
pnpm test:ci:frontend

# Run specific package tests
pushd packages/cli
pnpm test:unit
popd
```

### Integration Tests

```bash
# Run backend integration tests (SQLite)
pnpm test:ci:backend:integration

# Run with PostgreSQL
pushd packages/cli
pnpm test:postgres
popd
```

## CI Workflows

### Comprehensive Testing (`ci-comprehensive-testing.yml`)

Runs nightly and on demand:
- All unit tests across packages
- Integration tests with SQLite and PostgreSQL
- E2E tests with sharding
- Performance tests
- Binary smoke tests

### Release Validation (`release-validation.yml`)

Runs on release branches:
- Version consistency checks
- Multi-platform builds (Linux, macOS, Windows)
- Binary validation
- Docker build validation
- NPM publish dry run
- Security scanning

## Writing E2E Tests

### Test Structure

```typescript
import { test, expect } from '../../../fixtures/base';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ n8n }) => {
    await n8n.start.fromBlankCanvas();
  });

  test('should do something', async ({ n8n }) => {
    // Arrange
    await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

    // Act
    await n8n.workflowComposer.executeWorkflow();

    // Assert
    await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Page Objects**: Access UI elements through the `n8n` fixture
2. **Wait for Elements**: Use Playwright's auto-waiting with `await expect(...).toBeVisible()`
3. **Test IDs**: Use `data-test-id` attributes for stable selectors
4. **Isolation**: Each test starts with a clean state
5. **Parallelization**: Tests run in parallel by default

### Common Fixtures

- `n8n.canvas` - Canvas operations (add/remove nodes, connections)
- `n8n.ndv` - Node detail view operations
- `n8n.workflowComposer` - Workflow execution and saving
- `n8n.notifications` - Toast notification assertions
- `n8n.start` - Application startup helpers

## Database Testing

### SQLite (Default)
```bash
DB_TYPE=sqlite pnpm test:ci:backend:integration
```

### PostgreSQL
```bash
DB_TYPE=postgresdb \
DB_POSTGRESDB_HOST=localhost \
DB_POSTGRESDB_PORT=5432 \
DB_POSTGRESDB_DATABASE=n8n_test \
DB_POSTGRESDB_USER=postgres \
DB_POSTGRESDB_PASSWORD=postgres \
pnpm test:ci:backend:integration
```

## Coverage

Coverage is collected during CI runs:
- Codecov integration for tracking coverage trends
- Coverage flags for different test suites
- Reports generated in `coverage/` directory

```bash
# Run tests with coverage
COVERAGE_ENABLED=true pnpm test

# View coverage report
open coverage/lcov-report/index.html
```

## Debugging Tests

### Playwright Debugging
```bash
# Run with debug mode
PWDEBUG=1 pnpm --filter=n8n-playwright test:local -- --headed

# View trace
pnpm --filter=n8n-playwright exec playwright show-trace path/to/trace.zip
```

### Jest Debugging
```bash
# Run single test in watch mode
pushd packages/cli
pnpm test:dev -- --testPathPattern="specific-test"
popd
```

## Performance Testing

Performance tests are located in `packages/testing/playwright/tests/performance/`:

```bash
pnpm --filter=n8n-playwright test:performance
```

## Adding New Tests

1. **Choose the right level**: Unit < Integration < E2E
2. **Follow existing patterns**: Look at similar tests
3. **Use descriptive names**: Test name should describe the scenario
4. **Keep tests focused**: One assertion per test when possible
5. **Clean up resources**: Use `beforeEach`/`afterEach` for setup/teardown

## Test Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_BASE_URL` | Backend URL for E2E tests | `http://localhost:5680` |
| `RESET_E2E_DB` | Reset database before E2E tests | `false` |
| `SHOW_BROWSER` | Show browser during E2E tests | `false` |
| `DB_TYPE` | Database type for integration tests | `sqlite` |
| `COVERAGE_ENABLED` | Enable code coverage | `false` |
| `CI` | CI environment flag | `false` |
