export const isCI = !!(
    process.env['CI'] ||
    process.env['BUILD_NUMBER'] ||
    false
  );
  