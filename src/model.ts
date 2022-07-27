import type { JsonObject } from 'type-fest';
export type LoadingStatus =
  | {
      status: 'success';
      value: JsonObject;
    }
  | {
      status: 'file-not-found';
      filename: string;
    }
  | {
      status: 'parse-yaml-error';
      filename: string;
    };
