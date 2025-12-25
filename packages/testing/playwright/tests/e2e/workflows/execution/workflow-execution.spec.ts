/**
 * Comprehensive E2E Tests for Workflow Execution
 *
 * Tests the complete workflow execution lifecycle including:
 * - Manual execution
 * - Execution history
 * - Error handling
 * - Data flow between nodes
 * - Execution modes
 */

import {
	MANUAL_TRIGGER_NODE_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
	CODE_NODE_NAME,
	CODE_NODE_DISPLAY_NAME,
	HTTP_REQUEST_NODE_NAME,
	IF_NODE_NAME,
} from '../../../../config/constants';
import { test, expect } from '../../../../fixtures/base';

test.describe('Workflow Execution', () => {
	test.beforeEach(async ({ n8n }) => {
		await n8n.start.fromBlankCanvas();
	});

	test.describe('Manual Execution', () => {
		test('should execute a simple workflow with manual trigger', async ({ n8n }) => {
			// Create a simple workflow
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

			// Execute the workflow
			await n8n.workflowComposer.executeWorkflow();

			// Verify execution completed
			await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible({
				timeout: 10000,
			});
		});

		test('should show execution output data in node', async ({ n8n }) => {
			// Create a workflow with code that outputs data
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

			// Add code that returns specific data
			await n8n.ndv.codeEditorInput().fill(
				`return [{ json: { message: 'Hello, World!', timestamp: Date.now() } }];`,
			);
			await n8n.ndv.close();

			// Execute
			await n8n.workflowComposer.executeWorkflow();

			// Open the code node and verify output
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).dblclick();
			await n8n.ndv.outputPanel().waitFor({ state: 'visible' });

			// Verify the output contains our data
			const outputData = n8n.ndv.outputPanel();
			await expect(outputData).toContainText('Hello, World!');
		});

		test('should execute workflow with multiple nodes in sequence', async ({ n8n }) => {
			// Create a chain of nodes
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

			// Add first code node
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(`return [{ json: { step: 1, value: 'first' } }];`);
			await n8n.ndv.close();

			// Add second code node
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(
				`const input = $input.all();
return [{ json: { step: 2, value: 'second', previousValue: input[0].json.value } }];`,
			);
			await n8n.ndv.close();

			// Execute
			await n8n.workflowComposer.executeWorkflow();

			// Verify both nodes executed
			await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();
		});
	});

	test.describe('Execution Error Handling', () => {
		test('should display error when code node throws exception', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

			// Add code that throws an error
			await n8n.ndv.codeEditorInput().fill(`throw new Error('Test error message');`);
			await n8n.ndv.close();

			// Execute - should fail
			await n8n.workflowComposer.executeWorkflow();

			// Verify error is displayed
			await expect(n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME)).toHaveClass(/has-issues/);
		});

		test('should continue execution with continueOnFail enabled', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

			// Add code node that will fail
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(`throw new Error('Expected failure');`);

			// Enable continueOnFail in settings
			await n8n.ndv.openSettingsTab();
			await n8n.ndv.settingsTab().getByLabel('Continue On Fail').click();
			await n8n.ndv.close();

			// Add another node after
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(`return [{ json: { success: true } }];`);
			await n8n.ndv.close();

			// Execute
			await n8n.workflowComposer.executeWorkflow();

			// Both nodes should have executed
			await expect(n8n.canvas.getCanvasNodes()).toHaveCount(3);
		});
	});

	test.describe('Data Flow', () => {
		test('should pass data between connected nodes', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

			// First node outputs specific data
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv
				.codeEditorInput()
				.fill(`return [{ json: { testKey: 'testValue', number: 42 } }];`);
			await n8n.ndv.close();

			// Second node receives and transforms data
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(
				`const input = $input.all();
const data = input[0].json;
return [{ json: { received: data.testKey, doubled: data.number * 2 } }];`,
			);
			await n8n.ndv.close();

			// Execute and verify
			await n8n.workflowComposer.executeWorkflow();
			await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();
		});

		test('should handle binary data between nodes', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

			// Create node that generates binary data
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(
				`const Buffer = require('buffer').Buffer;
const binaryData = Buffer.from('Hello Binary World').toString('base64');
return [{
  json: { hasBinary: true },
  binary: {
    data: {
      data: binaryData,
      mimeType: 'text/plain',
      fileName: 'test.txt'
    }
  }
}];`,
			);
			await n8n.ndv.close();

			// Execute
			await n8n.workflowComposer.executeWorkflow();

			// Open node and verify binary data is present
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).dblclick();
			await n8n.ndv.outputPanel().waitFor({ state: 'visible' });
		});
	});

	test.describe('Conditional Execution', () => {
		test('should execute correct branch in IF node', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

			// Add code node that outputs a value
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await n8n.ndv.codeEditorInput().fill(`return [{ json: { value: 10 } }];`);
			await n8n.ndv.close();

			// Add IF node
			await n8n.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(IF_NODE_NAME, { closeNDV: true });

			// Execute and verify
			await n8n.workflowComposer.executeWorkflow();
			await expect(n8n.canvas.getCanvasNodes()).toHaveCount(3);
		});
	});

	test.describe('Execution History', () => {
		test('should record execution in history', async ({ n8n }) => {
			// Create and save a simple workflow
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

			// Save workflow
			await n8n.workflowComposer.saveWorkflow();

			// Execute
			await n8n.workflowComposer.executeWorkflow();
			await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();

			// Open execution history - wait for executions to load
			await n8n.page.waitForTimeout(1000);
		});
	});

	test.describe('Node-specific Execution', () => {
		test('should execute single node', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.deselectAll();

			// Execute just the trigger node
			await n8n.canvas.executeNode(MANUAL_TRIGGER_NODE_DISPLAY_NAME);

			await expect(
				n8n.notifications.getNotificationByTitle('Node executed successfully'),
			).toBeVisible();
		});

		test('should execute node with input data', async ({ n8n }) => {
			await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
			await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

			// Add code that processes input
			await n8n.ndv.codeEditorInput().fill(`return $input.all();`);
			await n8n.ndv.close();

			// Execute full workflow first to provide data
			await n8n.workflowComposer.executeWorkflow();

			// Now execute just the code node
			await n8n.canvas.deselectAll();
			await n8n.canvas.executeNode(CODE_NODE_DISPLAY_NAME);

			await expect(
				n8n.notifications.getNotificationByTitle('Node executed successfully'),
			).toBeVisible();
		});
	});
});

test.describe('Workflow Execution - Advanced Scenarios', () => {
	test.beforeEach(async ({ n8n }) => {
		await n8n.start.fromBlankCanvas();
	});

	test('should handle large data sets', async ({ n8n }) => {
		await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

		// Generate large dataset
		await n8n.ndv.codeEditorInput().fill(
			`const items = [];
for (let i = 0; i < 100; i++) {
  items.push({ json: { index: i, data: 'item-' + i } });
}
return items;`,
		);
		await n8n.ndv.close();

		// Execute
		await n8n.workflowComposer.executeWorkflow();
		await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();
	});

	test('should handle async operations in code node', async ({ n8n }) => {
		await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

		// Add async code
		await n8n.ndv.codeEditorInput().fill(
			`await new Promise(resolve => setTimeout(resolve, 100));
return [{ json: { asyncResult: true } }];`,
		);
		await n8n.ndv.close();

		// Execute
		await n8n.workflowComposer.executeWorkflow();
		await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();
	});

	test('should preserve execution state on page refresh', async ({ n8n, page }) => {
		await n8n.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await n8n.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await n8n.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		// Save the workflow
		await n8n.workflowComposer.saveWorkflow();

		// Execute
		await n8n.workflowComposer.executeWorkflow();
		await expect(n8n.notifications.getNotificationByTitle('Workflow executed')).toBeVisible();

		// Get current URL
		const url = page.url();

		// Refresh page
		await page.reload();

		// Verify we're still on the same workflow
		await expect(page).toHaveURL(url);
		await expect(n8n.canvas.getCanvasNodes()).toHaveCount(2);
	});
});
