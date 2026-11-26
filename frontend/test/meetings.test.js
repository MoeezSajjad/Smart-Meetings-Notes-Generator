import test from "node:test";
import assert from "node:assert/strict";
import { checkAudio, formatNotes, sample } from "../src/lib/meetings.js";

test("audio selection checks extension, empty files and the exact provider cap", () => {
  for (const name of ["audio.MP3", "audio.wav", "audio.m4a"])
    assert.equal(checkAudio({ name, size: 25_000_000 }), "");
  for (const input of [
    null,
    { name: "audio.wav", size: 0 },
    { name: "audio.mp4", size: 42 },
    { name: "audio.mp3", size: 25_000_001 },
  ])
    assert.ok(checkAudio(input));
});

test("text export includes all sections and identifies fictional content", () => {
  const text = formatNotes(sample, true);
  for (const token of [
    "FICTIONAL SAMPLE MEETING",
    "Summary",
    "Key points",
    "Transcript",
    "Action items",
    "Sam",
    "Maya",
    sample.transcript,
  ])
    assert.ok(text.includes(token));
  assert.ok(!formatNotes(sample).includes("FICTIONAL SAMPLE MEETING"));
});

test("empty lists export explicit empty states", () => {
  const text = formatNotes({
    title: "Example",
    transcript: "Hello.",
    notes: { summary: "Greeting", actionItems: [], keyPoints: [] },
  });
  assert.equal(text.split("None recorded.").length - 1, 2);
});
