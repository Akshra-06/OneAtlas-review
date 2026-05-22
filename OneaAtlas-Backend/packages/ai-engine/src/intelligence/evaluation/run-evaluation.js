/**
 * Run Intelligence Evaluation (JavaScript version)
 * 
 * Executes the comprehensive evaluation of the intelligence layer.
 */

const { intelligenceEvaluator } = require('./intelligence-evaluator.ts');

// Run the evaluation
console.log('Starting Intelligence Layer Evaluation...\n');
const report = intelligenceEvaluator.runTests();

// Output the report
console.log('\n=== INTELLIGENCE EVALUATION REPORT ===\n');
console.log(`Total Tests: ${report.totalTests}`);
console.log(`Passed Tests: ${report.passedTests}`);
console.log(`Failed Tests: ${report.failedTests}`);
console.log(`Overall Score: ${(report.overallScore * 100).toFixed(2)}%\n`);

console.log('--- Quality Metrics ---');
console.log(`Domain Accuracy: ${(report.domainAccuracy * 100).toFixed(2)}%`);
console.log(`Workflow Quality: ${(report.workflowQuality * 100).toFixed(2)}%`);
console.log(`Reasoning Quality: ${(report.reasoningQuality * 100).toFixed(2)}%`);
console.log(`Dashboard Relevance: ${(report.dashboardRelevance * 100).toFixed(2)}%`);
console.log(`Layout Adaptability: ${(report.layoutAdaptability * 100).toFixed(2)}%`);
console.log(`Hallucination Rate: ${(report.hallucinationRate * 100).toFixed(2)}%`);
console.log(`Generic Repetition Rate: ${(report.genericRepetitionRate * 100).toFixed(2)}%\n`);

console.log('--- Failure Patterns ---');
if (report.failurePatterns.length > 0) {
  for (const pattern of report.failurePatterns) {
    console.log(`- ${pattern}`);
  }
} else {
  console.log('No significant failure patterns detected');
}
console.log('');

console.log('--- Top Weaknesses ---');
if (report.topWeaknesses.length > 0) {
  for (const weakness of report.topWeaknesses) {
    console.log(`- ${weakness}`);
  }
} else {
  console.log('No significant weaknesses detected');
}
console.log('');

console.log('--- Recommendations ---');
if (report.recommendations.length > 0) {
  for (let i = 0; i < report.recommendations.length; i++) {
    console.log(`${i + 1}. ${report.recommendations[i]}`);
  }
} else {
  console.log('No recommendations needed');
}
console.log('');

// Output detailed results for failed tests
console.log('--- Failed Test Details ---');
const failedTests = report.detailedResults.filter(r => r.score < 70);
if (failedTests.length > 0) {
  for (const test of failedTests) {
    console.log(`\n[Test: ${test.testCase.id}]`);
    console.log(`Prompt: ${test.testCase.prompt}`);
    console.log(`Expected Domain: ${test.testCase.expectedDomain}`);
    console.log(`Predicted Domain: ${test.domainClassification.predicted}`);
    console.log(`Score: ${test.score}`);
    console.log(`Issues:`);
    for (const issue of test.issues) {
      console.log(`  - ${issue}`);
    }
  }
} else {
  console.log('All tests passed!');
}
console.log('');

// Save report to file
const fs = require('fs');
const reportPath = './intelligence-evaluation-report.json';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`Detailed report saved to: ${reportPath}`);
