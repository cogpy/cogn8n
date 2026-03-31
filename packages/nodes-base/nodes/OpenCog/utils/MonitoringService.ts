/**
 * MonitoringService
 *
 * Production health-check and metrics collection for OpenCog integrations.
 *
 * Tracks:
 * - Per-operation latency (min / max / avg)
 * - Success / error counts
 * - Connection health snapshots
 * - Configurable alert thresholds
 *
 * Usage:
 *   const monitor = new MonitoringService();
 *   const { result, metrics } = await monitor.track('addAtom', () => client.addAtom(...));
 *   const report = monitor.report();
 */

export interface OperationMetrics {
	operation: string;
	callCount: number;
	successCount: number;
	errorCount: number;
	totalDurationMs: number;
	minDurationMs: number;
	maxDurationMs: number;
	avgDurationMs: number;
	lastCalledAt: string;
	lastError?: string;
}

export interface HealthSnapshot {
	timestamp: string;
	healthy: boolean;
	connected: boolean;
	simulationMode: boolean;
	uptimeMs: number;
	operationsSummary: Record<
		string,
		{ calls: number; errors: number; avgMs: number }
	>;
	alerts: string[];
}

export interface AlertThresholds {
	/** Maximum acceptable average latency in ms (default: 5000) */
	maxAvgLatencyMs?: number;
	/** Minimum acceptable success rate 0–1 (default: 0.8) */
	minSuccessRate?: number;
	/** Minimum calls before rate-based alerts fire (default: 5) */
	minCallsForRateAlert?: number;
}

export interface TrackedResult<T> {
	result: T;
	durationMs: number;
	success: boolean;
	error?: string;
}

/**
 * Collects per-operation metrics and performs threshold-based health assessment.
 */
export class MonitoringService {
	private metrics = new Map<string, OperationMetrics>();
	private startedAt: number = Date.now();
	private thresholds: Required<AlertThresholds>;
	private connectionState: { connected: boolean; simulationMode: boolean } = {
		connected: false,
		simulationMode: true,
	};

	constructor(thresholds: AlertThresholds = {}) {
		this.thresholds = {
			maxAvgLatencyMs: thresholds.maxAvgLatencyMs ?? 5000,
			minSuccessRate: thresholds.minSuccessRate ?? 0.8,
			minCallsForRateAlert: thresholds.minCallsForRateAlert ?? 5,
		};
	}

	/**
	 * Update the cached connection state (call after each client.connect()).
	 */
	updateConnectionState(connected: boolean, simulationMode: boolean): void {
		this.connectionState = { connected, simulationMode };
	}

	/**
	 * Wrap an async operation to record its latency and success.
	 * Returns both the operation result and a timing summary.
	 */
	async track<T>(operation: string, fn: () => Promise<T>): Promise<TrackedResult<T>> {
		const start = Date.now();
		let success = false;
		let errorMsg: string | undefined;
		let result: T | undefined;

		try {
			result = await fn();
			success = true;
		} catch (err) {
			errorMsg = (err as Error).message;
			const durationMs = Date.now() - start;
			this.record(operation, durationMs, false, errorMsg);
			throw err;
		}

		const durationMs = Date.now() - start;
		this.record(operation, durationMs, success, errorMsg);
		return { result: result as T, durationMs, success };
	}

	/**
	 * Record a completed operation manually (useful when wrapping is not possible).
	 */
	record(operation: string, durationMs: number, success: boolean, error?: string): void {
		const existing = this.metrics.get(operation) ?? {
			operation,
			callCount: 0,
			successCount: 0,
			errorCount: 0,
			totalDurationMs: 0,
			minDurationMs: Infinity,
			maxDurationMs: 0,
			avgDurationMs: 0,
			lastCalledAt: '',
		};

		existing.callCount += 1;
		existing.totalDurationMs += durationMs;
		existing.minDurationMs = Math.min(existing.minDurationMs, durationMs);
		existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
		existing.avgDurationMs = existing.totalDurationMs / existing.callCount;
		existing.lastCalledAt = new Date().toISOString();

		if (success) {
			existing.successCount += 1;
		} else {
			existing.errorCount += 1;
			if (error) existing.lastError = error;
		}

		this.metrics.set(operation, existing);
	}

	/**
	 * Return a snapshot of all collected per-operation metrics.
	 */
	getMetrics(): OperationMetrics[] {
		return Array.from(this.metrics.values());
	}

	/**
	 * Return the metrics for a single operation, or undefined if not yet seen.
	 */
	getOperationMetrics(operation: string): OperationMetrics | undefined {
		return this.metrics.get(operation);
	}

	/**
	 * Evaluate current health against configured thresholds and return a snapshot.
	 */
	checkHealth(): HealthSnapshot {
		const alerts: string[] = [];
		const operationsSummary: HealthSnapshot['operationsSummary'] = {};

		for (const m of this.metrics.values()) {
			operationsSummary[m.operation] = {
				calls: m.callCount,
				errors: m.errorCount,
				avgMs: Math.round(m.avgDurationMs),
			};

			if (m.avgDurationMs > this.thresholds.maxAvgLatencyMs) {
				alerts.push(
					`HIGH LATENCY: operation '${m.operation}' avg ${Math.round(m.avgDurationMs)}ms exceeds ${this.thresholds.maxAvgLatencyMs}ms threshold`,
				);
			}

			if (m.callCount >= this.thresholds.minCallsForRateAlert) {
				const successRate = m.successCount / m.callCount;
				if (successRate < this.thresholds.minSuccessRate) {
					alerts.push(
						`LOW SUCCESS RATE: operation '${m.operation}' success rate ${(successRate * 100).toFixed(1)}% below ${(this.thresholds.minSuccessRate * 100).toFixed(1)}% threshold`,
					);
				}
			}
		}

		const healthy = alerts.length === 0;

		return {
			timestamp: new Date().toISOString(),
			healthy,
			connected: this.connectionState.connected,
			simulationMode: this.connectionState.simulationMode,
			uptimeMs: Date.now() - this.startedAt,
			operationsSummary,
			alerts,
		};
	}

	/**
	 * Generate a human-readable Markdown report.
	 */
	report(): string {
		const health = this.checkHealth();
		const lines: string[] = [
			'# OpenCog Monitoring Report',
			'',
			`**Generated**: ${health.timestamp}`,
			`**Uptime**: ${(health.uptimeMs / 1000).toFixed(1)}s`,
			`**Status**: ${health.healthy ? '✅ Healthy' : '⚠️ Issues Detected'}`,
			`**Connection**: ${health.connected ? 'Real Server' : health.simulationMode ? 'Simulation' : 'Disconnected'}`,
			'',
		];

		if (health.alerts.length > 0) {
			lines.push('## Alerts', '');
			for (const alert of health.alerts) {
				lines.push(`- ⚠️ ${alert}`);
			}
			lines.push('');
		}

		lines.push('## Operation Metrics', '');
		lines.push('| Operation | Calls | Errors | Avg (ms) | Min (ms) | Max (ms) | Success Rate |');
		lines.push('|-----------|------:|------:|---------:|---------:|---------:|-------------:|');

		for (const m of this.metrics.values()) {
			const rate =
				m.callCount > 0 ? ((m.successCount / m.callCount) * 100).toFixed(1) + '%' : 'N/A';
			const minMs = m.minDurationMs === Infinity ? 0 : m.minDurationMs;
			lines.push(
				`| ${m.operation} | ${m.callCount} | ${m.errorCount} | ${Math.round(m.avgDurationMs)} | ${minMs} | ${m.maxDurationMs} | ${rate} |`,
			);
		}

		lines.push('');
		return lines.join('\n');
	}

	/**
	 * Export full metrics as JSON for dashboards or external tooling.
	 */
	toJSON(): { health: HealthSnapshot; metrics: OperationMetrics[] } {
		return {
			health: this.checkHealth(),
			metrics: this.getMetrics(),
		};
	}

	/**
	 * Reset all collected metrics and restart the uptime clock.
	 */
	reset(): void {
		this.metrics.clear();
		this.startedAt = Date.now();
	}
}

/**
 * Module-level default monitoring instance.
 * Nodes can import and use this shared instance, or create their own.
 */
export const defaultMonitor = new MonitoringService();
