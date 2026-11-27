import { apiBase } from "../firebase";

const messages = {
  400: "The request was invalid. Check the audio format and try again.",
  401: "Your sign-in has expired. Please sign out and sign in again.",
  403: "Live processing is restricted to approved, email-verified accounts. The public sample is open to everyone.",
  404: "This meeting is unavailable. It may have expired.",
  413: "This file exceeds the 25 MB upload limit.",
  415: "The server could not recognize this recording. Use MP3, WAV or M4A.",
  429: "The demo quota is full. Try again later or explore the public sample.",
  503: "The service is temporarily unavailable. Please try again.",
};

export async function api(user, path, { body, signal } = {}) {
  const token = await user.getIdToken();
  const deadline = AbortSignal.timeout(body ? 120000 : 20000);
  const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;
  let response;
  try {
    response = await fetch(apiBase + path, {
      method: body ? "POST" : "GET",
      headers: { Authorization: "Bearer " + token },
      body,
      signal: combined,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      deadline.aborted
        ? "The request timed out. Check your dashboard before trying another upload."
        : "Could not reach the server. Check your connection and try again.",
    );
  }
  if (!response.ok)
    throw new Error(
      messages[response.status] || "The server could not complete the request.",
    );
  return response.json();
}
