export async function withRouteSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    const otel = await import('@opentelemetry/api');
    const tracer = otel.trace.getTracer('launchstack-web');
    return tracer.startActiveSpan(name, async (span) => {
      try {
        return await fn();
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: otel.SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  } catch {
    return fn();
  }
}
