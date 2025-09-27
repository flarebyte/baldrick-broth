/**
 * Responsibilities: Formats Zod issues into concise validation errors.
 * - Extracts useful details per error type and builds readable messages
 */
import type { z } from 'zod';

export type ValidationError = {
  message: string;
  path: string;
};
const read = (obj: unknown, key: string): unknown =>
  obj && typeof obj === 'object'
    ? (obj as Record<string, unknown>)[key]
    : undefined;

export const formatMessage = (issue: z.ZodIssue): ValidationError => {
  const path = issue.path.join('.');
  switch (issue.code) {
    case 'invalid_type': {
      return {
        path,
        message: [
          'The type for the field is invalid',
          `I would expect ${issue.expected} instead of ${(() => {
            const i = read(issue, 'input');
            if (Array.isArray(i)) return 'array';
            if (i === null) return 'null';
            const t = typeof i;
            return t === 'object' ? 'object' : t;
          })()}`,
        ].join('; '),
      };
    }

    case 'invalid_format': {
      return {
        path,
        message: [
          'The string format for the field is invalid',
          `${issue.message}`,
          `Format: ${String(read(issue, 'format') ?? '')}`,
          read(issue, 'pattern')
            ? `Pattern: ${String(read(issue, 'pattern'))}`
            : '',
        ].join('; '),
      };
    }

    case 'invalid_value': {
      return {
        path,
        message: [
          'The enum for the field is invalid',
          (() => {
            const values = read(issue, 'values');
            return Array.isArray(values)
              ? `I would expect any of ${values.map((v) => String(v)).join(', ')}`
              : 'I would expect a valid enum member';
          })(),
        ].join('; '),
      };
    }

    case 'invalid_union': {
      return {
        path,
        message: [
          'The union for the field is invalid',
          (() => {
            const errors = read(issue, 'errors');
            const flat: unknown[] = Array.isArray(errors)
              ? (errors as unknown[]).flat(1)
              : [];
            const msgs = flat
              .map((i) =>
                i && typeof i === 'object' && 'message' in i
                  ? String((i as { message?: unknown }).message ?? '')
                  : '',
              )
              .filter(Boolean)
              .join(', ');
            return msgs
              ? `I would check ${msgs}`
              : 'I would check individual union branches';
          })(),
        ].join('; '),
      };
    }

    case 'too_big': {
      return {
        path,
        message: [
          `The ${String(read(issue, 'origin'))} for the field is too big`,
          `I would expect the maximum to be ${String(read(issue, 'maximum'))}`,
        ].join('; '),
      };
    }

    case 'too_small': {
      return {
        path,
        message: [
          `The ${String(read(issue, 'origin'))} for the field is too small`,
          `I would expect the minimum to be ${String(read(issue, 'minimum'))}`,
        ].join('; '),
      };
    }

    case 'invalid_key': {
      return {
        path,
        message: [
          `The key for the ${String(read(issue, 'origin'))} is invalid`,
          (() => {
            const issues = read(issue, 'issues');
            const msgs = Array.isArray(issues)
              ? (issues as unknown[])
                  .map((i) =>
                    i && typeof i === 'object' && 'message' in i
                      ? String((i as { message?: unknown }).message ?? '')
                      : '',
                  )
                  .filter(Boolean)
                  .join(', ')
              : '';
            return msgs
              ? `I would check ${msgs}`
              : 'I would check the provided key';
          })(),
        ].join('; '),
      };
    }

    case 'invalid_element': {
      return {
        path,
        message: [
          `An element for the ${String(read(issue, 'origin'))} is invalid`,
          `Key: ${JSON.stringify(read(issue, 'key'))}`,
          (() => {
            const issues = read(issue, 'issues');
            const msgs = Array.isArray(issues)
              ? (issues as unknown[])
                  .map((i) =>
                    i && typeof i === 'object' && 'message' in i
                      ? String((i as { message?: unknown }).message ?? '')
                      : '',
                  )
                  .filter(Boolean)
                  .join(', ')
              : '';
            return msgs
              ? `I would check ${msgs}`
              : 'I would check the element details';
          })(),
        ].join('; '),
      };
    }

    case 'not_multiple_of': {
      return {
        path,
        message: [
          'The value is not a valid multiple',
          `I would expect a multiple of ${String(read(issue, 'divisor'))}`,
        ].join('; '),
      };
    }

    default: {
      return {
        path,
        message: [
          'The type for the field is incorrect',
          `${issue.message}`,
        ].join('; '),
      };
    }
  }
};
