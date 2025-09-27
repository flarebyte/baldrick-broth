/**
 * Responsibilities: Exposes environment-configurable paths.
 * - Provides the build file path with an environment override
 */
export const buildFilePath =
  // biome-ignore lint/complexity/useLiteralKeys: env index signature requires bracket access
  process.env['BALDRICK_BROTH_BUILD_FILE'] || './baldrick-broth.yaml';

/** Optional separate model file path (no env override for now). */
export const modelFilePath = './baldrick-broth-model.yaml';
