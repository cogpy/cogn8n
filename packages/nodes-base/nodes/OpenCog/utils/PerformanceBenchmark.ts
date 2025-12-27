/**
 * Performance benchmarking and monitoring utilities for OpenCog cognitive workflows
 */

export interface BenchmarkResult {
	operation: string;
	executionTime: number;
	memoryUsed: number;
	itemsProcessed: number;
	throughput: number;
	timestamp: Date;
}

export interface PerformanceMetrics {
	averageExecutionTime: number;
	minExecutionTime: number;
	maxExecutionTime: number;
	totalItemsProcessed: number;
	averageThroughput: number;
	memoryPeakUsage: number;
}

export class CognitiveBenchmark {
	private results: BenchmarkResult[] = [];

	/**
	 * Benchmark a cognitive operation
	 */
	async benchmark<T>(
		operation: string,
		fn: () => Promise<T> | T,
		itemCount: number = 1,
	): Promise<{ result: T; benchmark: BenchmarkResult }> {
		const startTime = performance.now();
		const startMemory = this.getMemoryUsage();

		const result = await fn();

		const endTime = performance.now();
		const endMemory = this.getMemoryUsage();

		const executionTime = endTime - startTime;
		const memoryUsed = endMemory - startMemory;
		const throughput = itemCount / (executionTime / 1000); // items per second

		const benchmarkResult: BenchmarkResult = {
			operation,
			executionTime,
			memoryUsed,
			itemsProcessed: itemCount,
			throughput,
			timestamp: new Date(),
		};

		this.results.push(benchmarkResult);

		return { result, benchmark: benchmarkResult };
	}

	/**
	 * Get aggregate performance metrics
	 */
	getMetrics(operation?: string): PerformanceMetrics {
		const filteredResults = operation
			? this.results.filter((r) => r.operation === operation)
			: this.results;

		if (filteredResults.length === 0) {
			return {
				averageExecutionTime: 0,
				minExecutionTime: 0,
				maxExecutionTime: 0,
				totalItemsProcessed: 0,
				averageThroughput: 0,
				memoryPeakUsage: 0,
			};
		}

		const executionTimes = filteredResults.map((r) => r.executionTime);
		const throughputs = filteredResults.map((r) => r.throughput);
		const memoryUsages = filteredResults.map((r) => r.memoryUsed);

		return {
			averageExecutionTime: this.average(executionTimes),
			minExecutionTime: Math.min(...executionTimes),
			maxExecutionTime: Math.max(...executionTimes),
			totalItemsProcessed: filteredResults.reduce((sum, r) => sum + r.itemsProcessed, 0),
			averageThroughput: this.average(throughputs),
			memoryPeakUsage: Math.max(...memoryUsages),
		};
	}

	/**
	 * Get all benchmark results
	 */
	getResults(): BenchmarkResult[] {
		return [...this.results];
	}

	/**
	 * Clear benchmark history
	 */
	clear(): void {
		this.results = [];
	}

	/**
	 * Generate performance report
	 */
	generateReport(): string {
		const operations = [...new Set(this.results.map((r) => r.operation))];
		let report = '# Cognitive Workflow Performance Report\n\n';
		report += `Generated: ${new Date().toISOString()}\n\n`;

		operations.forEach((operation) => {
			const metrics = this.getMetrics(operation);
			report += `## ${operation}\n\n`;
			report += `- Average Execution Time: ${metrics.averageExecutionTime.toFixed(2)}ms\n`;
			report += `- Min/Max Execution Time: ${metrics.minExecutionTime.toFixed(2)}ms / ${metrics.maxExecutionTime.toFixed(2)}ms\n`;
			report += `- Total Items Processed: ${metrics.totalItemsProcessed}\n`;
			report += `- Average Throughput: ${metrics.averageThroughput.toFixed(2)} items/sec\n`;
			report += `- Peak Memory Usage: ${(metrics.memoryPeakUsage / 1024 / 1024).toFixed(2)}MB\n\n`;
		});

		// Overall statistics
		const overallMetrics = this.getMetrics();
		report += '## Overall Statistics\n\n';
		report += `- Total Operations: ${this.results.length}\n`;
		report += `- Average Execution Time: ${overallMetrics.averageExecutionTime.toFixed(2)}ms\n`;
		report += `- Total Items Processed: ${overallMetrics.totalItemsProcessed}\n`;
		report += `- Overall Throughput: ${overallMetrics.averageThroughput.toFixed(2)} items/sec\n`;

		return report;
	}

	/**
	 * Export results as JSON
	 */
	exportJSON(): string {
		return JSON.stringify(
			{
				results: this.results,
				metrics: this.getMetrics(),
				generatedAt: new Date().toISOString(),
			},
			null,
			2,
		);
	}

	/**
	 * Export results as CSV
	 */
	exportCSV(): string {
		const headers = [
			'Operation',
			'Execution Time (ms)',
			'Memory Used (MB)',
			'Items Processed',
			'Throughput (items/s)',
			'Timestamp',
		];

		const rows = this.results.map((r) => [
			r.operation,
			r.executionTime.toFixed(2),
			(r.memoryUsed / 1024 / 1024).toFixed(2),
			r.itemsProcessed,
			r.throughput.toFixed(2),
			r.timestamp.toISOString(),
		]);

		return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
	}

	/**
	 * Helper: Calculate average
	 */
	private average(numbers: number[]): number {
		if (numbers.length === 0) return 0;
		return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
	}

	/**
	 * Helper: Get memory usage
	 * Returns 0 when memory tracking is unavailable (e.g., browser environment)
	 */
	private getMemoryUsage(): number {
		if (typeof process !== 'undefined' && process.memoryUsage) {
			return process.memoryUsage().heapUsed;
		}
		// Return 0 when process.memoryUsage is unavailable
		// Memory metrics will show 0 delta in non-Node.js environments
		return 0;
	}
}

/**
 * Cognitive operation profiler for detailed analysis
 */
export class CognitiveProfiler {
	private profiles: Map<string, Array<{ duration: number; metadata: any }>> = new Map();

	/**
	 * Start profiling an operation
	 */
	start(operationId: string): () => void {
		const startTime = performance.now();
		const startMemory = this.getMemoryUsage();

		return (metadata?: any) => {
			const duration = performance.now() - startTime;
			const memoryDelta = this.getMemoryUsage() - startMemory;

			if (!this.profiles.has(operationId)) {
				this.profiles.set(operationId, []);
			}

			this.profiles.get(operationId)!.push({
				duration,
				metadata: { ...metadata, memoryDelta },
			});
		};
	}

	/**
	 * Get profile data for an operation
	 */
	getProfile(operationId: string): {
		count: number;
		averageDuration: number;
		minDuration: number;
		maxDuration: number;
		totalDuration: number;
	} | null {
		const data = this.profiles.get(operationId);
		if (!data || data.length === 0) return null;

		const durations = data.map((d) => d.duration);
		return {
			count: data.length,
			averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
			minDuration: Math.min(...durations),
			maxDuration: Math.max(...durations),
			totalDuration: durations.reduce((a, b) => a + b, 0),
		};
	}

	/**
	 * Get all profiles
	 */
	getAllProfiles(): Map<string, any> {
		const result = new Map();
		for (const key of this.profiles.keys()) {
			result.set(key, this.getProfile(key));
		}
		return result;
	}

	/**
	 * Clear profiles
	 */
	clear(): void {
		this.profiles.clear();
	}

	/**
	 * Helper: Get memory usage
	 * Returns 0 when memory tracking is unavailable (e.g., browser environment)
	 */
	private getMemoryUsage(): number {
		if (typeof process !== 'undefined' && process.memoryUsage) {
			return process.memoryUsage().heapUsed;
		}
		// Return 0 when process.memoryUsage is unavailable
		// Memory metrics will show 0 delta in non-Node.js environments
		return 0;
	}
}

/**
 * Example usage:
 *
 * const benchmark = new CognitiveBenchmark();
 *
 * // Benchmark AtomSpace operation
 * const { result, benchmark: atomBench } = await benchmark.benchmark(
 *   'AtomSpace.addAtom',
 *   async () => await atomSpace.addAtom(...),
 *   100
 * );
 *
 * // Benchmark reasoning
 * const { result: reasoning, benchmark: reasonBench } = await benchmark.benchmark(
 *   'ReasoningEngine.forwardChain',
 *   async () => await reasoningEngine.run(...),
 *   1
 * );
 *
 * // Generate report
 * console.log(benchmark.generateReport());
 *
 * // Use profiler for detailed analysis
 * const profiler = new CognitiveProfiler();
 * const end = profiler.start('complexOperation');
 * // ... do work
 * end({ itemsProcessed: 50 });
 * console.log(profiler.getProfile('complexOperation'));
 */
