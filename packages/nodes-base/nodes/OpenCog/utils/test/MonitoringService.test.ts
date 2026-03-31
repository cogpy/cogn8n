import { MonitoringService, defaultMonitor } from '../MonitoringService';

describe('MonitoringService', () => {
	let monitor: MonitoringService;

	beforeEach(() => {
		monitor = new MonitoringService({
			maxAvgLatencyMs: 1000,
			minSuccessRate: 0.8,
			minCallsForRateAlert: 3,
		});
	});

	describe('record()', () => {
		test('records a successful operation', () => {
			monitor.record('addAtom', 50, true);
			const metrics = monitor.getOperationMetrics('addAtom');
			expect(metrics).toBeDefined();
			expect(metrics!.callCount).toBe(1);
			expect(metrics!.successCount).toBe(1);
			expect(metrics!.errorCount).toBe(0);
			expect(metrics!.avgDurationMs).toBe(50);
			expect(metrics!.minDurationMs).toBe(50);
			expect(metrics!.maxDurationMs).toBe(50);
		});

		test('records a failed operation with error message', () => {
			monitor.record('queryAtoms', 200, false, 'Timeout');
			const metrics = monitor.getOperationMetrics('queryAtoms');
			expect(metrics!.errorCount).toBe(1);
			expect(metrics!.successCount).toBe(0);
			expect(metrics!.lastError).toBe('Timeout');
		});

		test('aggregates multiple calls correctly', () => {
			monitor.record('op', 100, true);
			monitor.record('op', 200, true);
			monitor.record('op', 300, false, 'err');
			const metrics = monitor.getOperationMetrics('op');
			expect(metrics!.callCount).toBe(3);
			expect(metrics!.successCount).toBe(2);
			expect(metrics!.errorCount).toBe(1);
			expect(metrics!.avgDurationMs).toBeCloseTo(200);
			expect(metrics!.minDurationMs).toBe(100);
			expect(metrics!.maxDurationMs).toBe(300);
		});
	});

	describe('track()', () => {
		test('returns result and records success', async () => {
			const { result, success } = await monitor.track('addAtom', async () => 42);
			expect(result).toBe(42);
			expect(success).toBe(true);
			expect(monitor.getOperationMetrics('addAtom')!.successCount).toBe(1);
		});

		test('records failure and re-throws on error', async () => {
			await expect(
				monitor.track('failOp', async () => {
					throw new Error('boom');
				}),
			).rejects.toThrow('boom');
			const metrics = monitor.getOperationMetrics('failOp');
			expect(metrics!.errorCount).toBe(1);
		});
	});

	describe('checkHealth()', () => {
		test('returns healthy when no alerts triggered', () => {
			monitor.record('addAtom', 100, true);
			monitor.record('addAtom', 100, true);
			const health = monitor.checkHealth();
			expect(health.healthy).toBe(true);
			expect(health.alerts).toHaveLength(0);
		});

		test('raises high latency alert when avg exceeds threshold', () => {
			monitor.record('slowOp', 1500, true);
			const health = monitor.checkHealth();
			expect(health.healthy).toBe(false);
			expect(health.alerts.some((a) => a.includes('HIGH LATENCY'))).toBe(true);
		});

		test('raises low success rate alert when rate drops below threshold', () => {
			// 1 success, 3 failures = 25% success rate, below 80% threshold
			monitor.record('unreliableOp', 50, true);
			monitor.record('unreliableOp', 50, false);
			monitor.record('unreliableOp', 50, false);
			monitor.record('unreliableOp', 50, false);
			const health = monitor.checkHealth();
			expect(health.healthy).toBe(false);
			expect(health.alerts.some((a) => a.includes('LOW SUCCESS RATE'))).toBe(true);
		});

		test('does not raise success rate alert below minCallsForRateAlert', () => {
			// Only 2 calls (< minCallsForRateAlert=3), all failures
			monitor.record('rareOp', 50, false);
			monitor.record('rareOp', 50, false);
			const health = monitor.checkHealth();
			// Should not alert on rate since calls < threshold
			expect(health.alerts.some((a) => a.includes('LOW SUCCESS RATE'))).toBe(false);
		});

		test('includes operationsSummary', () => {
			monitor.record('addAtom', 100, true);
			const health = monitor.checkHealth();
			expect(health.operationsSummary).toHaveProperty('addAtom');
			expect(health.operationsSummary.addAtom.calls).toBe(1);
		});

		test('reflects connection state updates', () => {
			monitor.updateConnectionState(true, false);
			const health = monitor.checkHealth();
			expect(health.connected).toBe(true);
			expect(health.simulationMode).toBe(false);
		});
	});

	describe('report()', () => {
		test('generates a Markdown report string', () => {
			monitor.record('addAtom', 100, true);
			const report = monitor.report();
			expect(typeof report).toBe('string');
			expect(report).toContain('# OpenCog Monitoring Report');
			expect(report).toContain('addAtom');
		});

		test('includes alert section when there are alerts', () => {
			monitor.record('slowOp', 2000, true);
			const report = monitor.report();
			expect(report).toContain('## Alerts');
			expect(report).toContain('HIGH LATENCY');
		});

		test('does not include alert section when healthy', () => {
			monitor.record('fastOp', 50, true);
			const report = monitor.report();
			expect(report).not.toContain('## Alerts');
		});
	});

	describe('toJSON()', () => {
		test('returns health and metrics', () => {
			monitor.record('addAtom', 100, true);
			const json = monitor.toJSON();
			expect(json).toHaveProperty('health');
			expect(json).toHaveProperty('metrics');
			expect(Array.isArray(json.metrics)).toBe(true);
			expect(json.metrics[0].operation).toBe('addAtom');
		});
	});

	describe('reset()', () => {
		test('clears all metrics', () => {
			monitor.record('addAtom', 100, true);
			monitor.reset();
			expect(monitor.getMetrics()).toHaveLength(0);
		});
	});

	describe('getMetrics()', () => {
		test('returns all collected operation metrics', () => {
			monitor.record('op1', 100, true);
			monitor.record('op2', 200, true);
			const metrics = monitor.getMetrics();
			expect(metrics).toHaveLength(2);
			expect(metrics.map((m) => m.operation)).toContain('op1');
			expect(metrics.map((m) => m.operation)).toContain('op2');
		});
	});

	describe('defaultMonitor', () => {
		test('is a shared MonitoringService instance', () => {
			expect(defaultMonitor).toBeInstanceOf(MonitoringService);
		});
	});
});
