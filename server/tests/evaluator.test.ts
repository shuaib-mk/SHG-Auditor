import { describe, it, expect } from 'vitest';
import { runEvaluationSuite } from '../services/evaluator.js';

describe('Evaluation Benchmark Suite', () => {
  it('runs across 30 synthetic SHG test pages and reports accuracy metrics', () => {
    const results = runEvaluationSuite();

    expect(results.totalTestPages).toBe(30);
    expect(results.totalPlantedDiscrepancies).toBeGreaterThan(0);
    expect(results.precision).toBeGreaterThanOrEqual(0.9);
    expect(results.recall).toBeGreaterThanOrEqual(0.9);
    expect(results.f1Score).toBeGreaterThanOrEqual(0.9);
    expect(results.arithmeticAccuracy).toBe(100.0);
    expect(results.tests.length).toBe(30);
  });
});
