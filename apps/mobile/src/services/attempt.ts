export interface OperationAttempt {
  payload: string;
  key: string;
}

/** Preserve the key when retrying an operation whose result is unknown. */
export function operationAttempt(
  previous: OperationAttempt | null,
  input: unknown,
  createKey: () => string,
): OperationAttempt {
  const payload = JSON.stringify(input);
  if (previous?.payload === payload) return previous;
  return { payload, key: createKey() };
}
