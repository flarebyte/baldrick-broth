export const isCI = Boolean(
  // biome-ignore lint/complexity/useLiteralKeys: env index signature requires bracket access
  process.env['CI'] || process.env['BUILD_NUMBER'] || false,
);
