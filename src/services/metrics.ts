export interface MetricSnapshot {
  requests: Record<string, number>;
  errors: Record<string, number>;
  durations: Record<string, number[]>;
}

export class Metrics {
  private requests: Record<string, number> = {};
  private errors: Record<string, number> = {};
  private durations: Record<string, number[]> = {};

  recordRequest(tool: string) {
    this.requests[tool] = (this.requests[tool] ?? 0) + 1;
  }

  recordError(tool: string) {
    this.errors[tool] = (this.errors[tool] ?? 0) + 1;
  }

  recordDuration(tool: string, durationMs: number) {
    if (!this.durations[tool]) this.durations[tool] = [];
    this.durations[tool].push(durationMs);
  }

  snapshot(): MetricSnapshot {
    return {
      requests: { ...this.requests },
      errors: { ...this.errors },
      durations: { ...this.durations },
    };
  }
}

export const metrics = new Metrics();
