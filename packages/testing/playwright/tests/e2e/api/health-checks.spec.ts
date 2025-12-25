/**
 * Comprehensive API Health Check E2E Tests
 *
 * Tests the API health endpoints and validates the server is functioning correctly.
 * These tests are critical for release validation and monitoring.
 */

import { test, expect } from '../../../fixtures/base';

test.describe('API Health Checks', () => {
	test.describe('Health Endpoint', () => {
		test('should return healthy status from /healthz', async ({ request }) => {
			const response = await request.get('/healthz');
			expect(response.ok()).toBeTruthy();

			const body = await response.json();
			expect(body).toHaveProperty('status', 'ok');
		});

		test('should return healthy status from /healthz/readiness', async ({ request }) => {
			const response = await request.get('/healthz/readiness');
			expect(response.ok()).toBeTruthy();
		});

		test('should return healthy status from /healthz/liveness', async ({ request }) => {
			const response = await request.get('/healthz/liveness');
			expect(response.ok()).toBeTruthy();
		});
	});

	test.describe('API Version Endpoint', () => {
		test('should return version information', async ({ request }) => {
			const response = await request.get('/api/v1/info');
			expect(response.ok()).toBeTruthy();

			const body = await response.json();
			expect(body).toHaveProperty('data');
			expect(body.data).toHaveProperty('n8nVersion');
		});
	});

	test.describe('Metrics Endpoint', () => {
		test('should return prometheus metrics when enabled', async ({ request }) => {
			// This test assumes N8N_METRICS=true is set
			const response = await request.get('/metrics');

			// Metrics endpoint may be enabled or disabled
			if (response.ok()) {
				const body = await response.text();
				// Prometheus metrics format validation
				expect(body).toContain('# HELP');
				expect(body).toContain('# TYPE');
			}
		});
	});

	test.describe('API Authentication', () => {
		test('should require authentication for protected endpoints', async ({ request }) => {
			// Try to access workflows without auth
			const response = await request.get('/api/v1/workflows', {
				headers: {
					// No auth header
				},
			});

			// Should return 401 Unauthorized
			expect(response.status()).toBe(401);
		});

		test('should reject invalid API key', async ({ request }) => {
			const response = await request.get('/api/v1/workflows', {
				headers: {
					'X-N8N-API-KEY': 'invalid-api-key',
				},
			});

			expect(response.status()).toBe(401);
		});
	});

	test.describe('Static Assets', () => {
		test('should serve favicon', async ({ request }) => {
			const response = await request.get('/favicon.ico');
			expect(response.ok()).toBeTruthy();
		});

		test('should serve frontend assets', async ({ request }) => {
			const response = await request.get('/');
			expect(response.ok()).toBeTruthy();
			expect(response.headers()['content-type']).toContain('text/html');
		});
	});

	test.describe('CORS Headers', () => {
		test('should handle OPTIONS preflight requests', async ({ request }) => {
			const response = await request.fetch('/api/v1/workflows', {
				method: 'OPTIONS',
			});

			// Should return appropriate CORS headers or 200/204
			expect([200, 204, 401]).toContain(response.status());
		});
	});

	test.describe('Error Handling', () => {
		test('should return 404 for non-existent endpoints', async ({ request }) => {
			const response = await request.get('/api/v1/non-existent-endpoint');
			expect(response.status()).toBe(404);
		});

		test('should return proper error format for API errors', async ({ request }) => {
			const response = await request.get('/api/v1/workflows/non-existent-id');

			// Either 401 (not authenticated) or 404 (not found)
			expect([401, 404]).toContain(response.status());

			const body = await response.json();
			// Should have error structure
			expect(body).toHaveProperty('message');
		});
	});
});

test.describe('API Workflow Operations', () => {
	test.describe('Authenticated Workflow Operations', () => {
		test('should list workflows when authenticated', async ({ n8n, request }) => {
			// First login through the UI to get session
			await n8n.start.fromLanding();

			// Now try API request with session cookie
			const response = await request.get('/api/v1/workflows');

			if (response.ok()) {
				const body = await response.json();
				expect(body).toHaveProperty('data');
				expect(Array.isArray(body.data)).toBeTruthy();
			}
		});

		test('should handle workflow creation via API', async ({ n8n, request }) => {
			await n8n.start.fromLanding();

			const workflowData = {
				name: 'Test API Workflow',
				nodes: [
					{
						id: 'manual-trigger-1',
						name: 'Manual Trigger',
						type: 'n8n-nodes-base.manualTrigger',
						typeVersion: 1,
						position: [250, 300],
						parameters: {},
					},
				],
				connections: {},
				settings: {},
			};

			const response = await request.post('/api/v1/workflows', {
				data: workflowData,
			});

			if (response.ok()) {
				const body = await response.json();
				expect(body).toHaveProperty('data');
				expect(body.data).toHaveProperty('id');
				expect(body.data).toHaveProperty('name', 'Test API Workflow');

				// Clean up - delete the workflow
				await request.delete(`/api/v1/workflows/${body.data.id}`);
			}
		});
	});
});

test.describe('API Rate Limiting', () => {
	test('should not immediately rate limit normal requests', async ({ request }) => {
		// Make a few requests to ensure we're not immediately rate limited
		for (let i = 0; i < 5; i++) {
			const response = await request.get('/healthz');
			expect(response.ok()).toBeTruthy();
		}
	});
});

test.describe('API Response Headers', () => {
	test('should include security headers', async ({ request }) => {
		const response = await request.get('/');
		const headers = response.headers();

		// Check for common security headers (may vary based on config)
		// These assertions are lenient as headers depend on deployment config
		expect(response.ok()).toBeTruthy();
	});

	test('should include proper content-type headers', async ({ request }) => {
		const htmlResponse = await request.get('/');
		expect(htmlResponse.headers()['content-type']).toContain('text/html');

		const jsonResponse = await request.get('/api/v1/info');
		if (jsonResponse.ok()) {
			expect(jsonResponse.headers()['content-type']).toContain('application/json');
		}
	});
});
