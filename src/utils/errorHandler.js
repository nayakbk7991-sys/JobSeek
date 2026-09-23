export function getErrorMessage(
  error,
  fallbackMessage = "Something went wrong. Please try again."
) {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error ===
      "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  return fallbackMessage;
}

export function logError(
  context,
  error
) {
  console.error(
    `[JobSeek] ${context}`,
    error
  );
}