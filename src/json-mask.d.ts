declare module 'json-mask' {
  /**
   * Apply a JSON mask to an object
   * @param obj the object to apply the mask on
   * @param mask a mask as defined in https://github.com/nemtsov/json-mask
   */
  export default function json_mask(obj: unknown, mask: string): unknown;
}
