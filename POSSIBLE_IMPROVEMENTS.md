# Possible Improvements

## Refactor Zod Error Handling (v4)

Motivation

-   Reduce brittle `switch(issue.code)` logic and rely on Zod v4 helpers.
-   Produce consistent, user-friendly messages and structured data for
    repair.

Proposal

-   Introduce a formatter that converts a `ZodError` into your existing
    `ValidationError[]` using Zod v4 helpers.

Suggested API

-   `formatZodError(err: z.ZodError): ValidationError[]` — tree-based
    per-field messages.
-   Optionally return a `prettified` string for CLI logs or LLM prompts.

Implementation Sketch

```ts
// src/format-error.ts (new)
import { z } from "zod";

export type ValidationError = { message: string; path: string };

export function formatZodError<T>(err: z.ZodError<T>): ValidationError[] {
  const tree = z.treeifyError(err);
  const out: ValidationError[] = [];
  walk(tree, [], out);
  return out;
}

type ErrorTree<T> = z.core.$ZodErrorTree<T>;

function walk(
  node: ErrorTree<unknown>,
  path: (string | number)[],
  acc: ValidationError[],
) {
  for (const msg of node.errors ?? [])
    acc.push({ path: toDotPath(path), message: msg });
  if (node.items)
    node.items.forEach((child, i) => walk(child, [...path, i], acc));
  if (node.properties)
    for (const [k, child] of Object.entries(node.properties))
      walk(child as ErrorTree<unknown>, [...path, k], acc);
}

function toDotPath(path: (string | number)[]): string {
  return path
    .map((seg) => (typeof seg === "number" ? `[${seg}]` : seg))
    .reduce(
      (acc, seg, i) =>
        typeof seg === "string" && i > 0 && !seg.startsWith("[")
          ? `${acc}.${seg}`
          : `${acc}${seg}`,
      "",
    );
}
```

Call Site Changes

-   In `safeParseBuild`, replace `issues.map(formatMessage)` with:

```ts
import { formatZodError } from "./format-error.js";
const errors = formatZodError(result.error);
```

Optional Enhancements

-   `z.prettifyError(result.error)` for a one-string human/LLM summary.
-   `z.flattenError(result.error)` when you need a form-like mapping
    (`formErrors` and `fieldErrors`).

Benefits

-   Fewer manual mappings across Zod versions.
-   Cleaner, more maintainable error formatting.

## Zod v3 → v4 Migration Checklist (issues and messages)

-   Switch from `error.errors` to `error.issues` when inspecting parse
    failures.
-   Match on `issue.code` (e.g., `"invalid_value"`, `"too_small"`,
    `"invalid_key"`).
-   Remap old codes:
    -   `invalid_enum_value` / `invalid_literal` → `invalid_value`
    -   Add support for new `invalid_key` / `invalid_element`
-   Prefer schema-level `error` instead of `message`, `errorMap`,
    `invalid_type_error`, `required_error`.
-   Expect `.default()` / `.catch()` values to apply even when optional
    fields are absent.
-   Use `safeParse` for agent loops; branch on success/failure.
-   Leverage helpers for formatting:
    -   `flattenError` for form/tool args
    -   `treeifyError` for structured repair
    -   `prettifyError` for human/LLM messaging
