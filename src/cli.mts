#!/usr/bin/env node

/**
 * Responsibilities: CLI entrypoint for baldrick-broth.
 * - Delegates to runClient to execute the YAML-driven CLI
 */
import { runClient } from './client.js';

await runClient();
