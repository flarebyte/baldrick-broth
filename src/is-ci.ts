export const isCI = Boolean(
  process.env.CI || process.env.BUILD_NUMBER || false,
);
