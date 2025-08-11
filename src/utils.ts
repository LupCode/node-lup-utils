/**
 * Pauses execution for a specified duration.
 *
 * @param ms Duration to sleep in milliseconds.
 * @returns A promise that resolves after the specified duration.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
