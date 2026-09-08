export const mockDelay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));
