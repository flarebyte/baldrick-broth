import type { z } from 'zod';

export type ValidationError = {
  message: string;
  path: string;
};
export const formatMessage = (issue: z.ZodIssue): ValidationError => {
  const path = issue.path.join('.');
  switch (issue.code) {
    case 'invalid_type': {
      return {
        path,
        message: [
          'The type for the field is invalid',
          `I would expect ${issue.expected} instead of ${(() => {
            const i = (issue as any).input as unknown;
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
          `Format: ${(issue as any).format}`,
          (issue as any).pattern ? `Pattern: ${(issue as any).pattern}` : '',
        ].join('; '),
      };
    }

    case 'invalid_value': {
      return {
        path,
        message: [
          'The enum for the field is invalid',
          `I would expect any of ${(issue as any).values?.join(', ')}`,
        ].join('; '),
      };
    }

    case 'invalid_union': {
      return {
        path,
        message: [
          'The union for the field is invalid',
          `I would check ${((issue as any).errors as z.ZodIssue[][])
            .flat()
            .map((i) => i.message)
            .join(', ')}`,
        ].join('; '),
      };
    }

    case 'too_big': {
      return {
        path,
        message: [
          `The ${String((issue as any).origin)} for the field is too big`,
          `I would expect the maximum to be ${(issue as any).maximum}`,
        ].join('; '),
      };
    }

    case 'too_small': {
      return {
        path,
        message: [
          `The ${String((issue as any).origin)} for the field is too small`,
          `I would expect the minimum to be ${(issue as any).minimum}`,
        ].join('; '),
      };
    }

    case 'invalid_key': {
      return {
        path,
        message: [
          `The key for the ${String((issue as any).origin)} is invalid`,
          `I would check ${((issue as any).issues as z.ZodIssue[])
            .map((i) => i.message)
            .join(', ')}`,
        ].join('; '),
      };
    }

    case 'invalid_element': {
      return {
        path,
        message: [
          `An element for the ${String((issue as any).origin)} is invalid`,
          `Key: ${JSON.stringify((issue as any).key)}`,
          `I would check ${((issue as any).issues as z.ZodIssue[])
            .map((i) => i.message)
            .join(', ')}`,
        ].join('; '),
      };
    }

    case 'not_multiple_of': {
      return {
        path,
        message: [
          'The value is not a valid multiple',
          `I would expect a multiple of ${(issue as any).divisor}`,
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
