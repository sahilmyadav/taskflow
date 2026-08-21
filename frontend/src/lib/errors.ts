import axios from "axios";

/**
 * Pulls a human-readable message out of an unknown thrown value.
 * Nest's ValidationPipe returns `message` as a string or an array of strings.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (msg) return msg;
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
