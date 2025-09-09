
export function createReadableStreamFromAsyncIterator(asyncIterator: AsyncGenerator<string | Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await asyncIterator.next();
      if (done) {
        controller.close();
        return;
      }
      const chunk = typeof value === 'string' ? new TextEncoder().encode(value) : value;
      controller.enqueue(chunk);
    },
    cancel() {
      // optionally cleanup
    },
  });
}
