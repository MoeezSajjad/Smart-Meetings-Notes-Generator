import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { access, mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateKeyPair, SignJWT } from "jose";
import { createApp } from "../src/app.js";
import { verifyFirebaseToken } from "../src/middlewares/requireUser.js";
import { MAX_BYTES } from "../src/middlewares/uploadMiddleware.js";
import {
  validateNotes,
  generateNotesFromTranscript,
} from "../src/services/notesService.js";
import { processAudioFile } from "../src/services/processingService.js";
import { getMeeting } from "../src/services/storageService.js";

const project = "meeting-test";
const issuer = "https://securetoken.google.com/" + project;
const keys = await generateKeyPair("RS256");
const notes = {
  summary: "Support handover.",
  keyPoints: ["Check the ticket."],
  actionItems: [{ task: "Review the ticket", owner: null, priority: "low" }],
};
const now = Math.floor(Date.now() / 1000);
function token(uid, options = {}) {
  return new SignJWT({
    auth_time: now - 20,
    email: "tester@example.com",
    email_verified: true,
    ...options.claims,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(issuer)
    .setAudience(options.aud || project)
    .setSubject(uid)
    .setIssuedAt(now - 10)
    .setExpirationTime(options.exp ?? now + 600)
    .sign(keys.privateKey);
}
const auth = (token) => ({ Authorization: "Bearer " + token });
let server, url;
before(async () => {
  const app = createApp({
    project,
    origins: ["https://sample.example"],
    allowed: new Set(["tester@example.com"]),
    verify: (jwt, project) => verifyFirebaseToken(jwt, project, keys.publicKey),
    processFile: (id, file) =>
      processAudioFile(
        id,
        file,
        async () => "Review the ticket.",
        async () => notes,
      ),
  });
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  url = "http://127.0.0.1:" + server.address().port;
});
after(() => new Promise((resolve) => server.close(resolve)));
async function upload(uid, buffer) {
  const form = new FormData();
  form.set("audio", new Blob([buffer], { type: "audio/wav" }), "example.wav");
  return fetch(url + "/api/audio/upload", {
    method: "POST",
    headers: auth(await token(uid)),
    body: form,
  });
}
test("health is public and CORS matches the configured frontend", async () => {
  const good = await fetch(url + "/api/health", {
    headers: { Origin: "https://sample.example" },
  });
  assert.equal((await good.json()).status, "ok");
  assert.equal(
    good.headers.get("access-control-allow-origin"),
    "https://sample.example",
  );
  const other = await fetch(url + "/api/health", {
    headers: { Origin: "https://unrelated.example" },
  });
  assert.equal(other.headers.get("access-control-allow-origin"), null);
});
test("missing session, expired token, wrong audience and unverified email", async () => {
  const endpoint = url + "/api/audio/meetings";
  assert.equal((await fetch(endpoint)).status, 401);
  for (const t of [
    await token("user", { exp: now - 1 }),
    await token("user", { aud: "another-project" }),
  ]) {
    assert.equal((await fetch(endpoint, { headers: auth(t) })).status, 401);
  }
  const unverified = await token("user", { claims: { email_verified: false } });
  assert.equal(
    (await fetch(endpoint, { headers: auth(unverified) })).status,
    403,
  );
});
test("upload, list, polling, notes and account isolation", async () => {
  const response = await upload("alice", Buffer.from("RIFF0000WAVEfmt "));
  assert.equal(response.status, 201);
  const {
    data: { meetingId },
  } = await response.json();
  const endpoint = url + "/api/audio/status/" + meetingId;
  const alice = auth(await token("alice")),
    bob = auth(await token("bob"));
  assert.equal((await fetch(endpoint, { headers: bob })).status, 404);
  assert.deepEqual(
    (await (await fetch(url + "/api/audio/meetings", { headers: bob })).json())
      .meetings,
    [],
  );
  const status = await (await fetch(endpoint, { headers: alice })).json();
  assert.equal(status.status, "ready");
  assert.deepEqual(status.data.notes, notes);
  assert.equal(status.data.transcript, "Review the ticket.");
  const list = await (
    await fetch(url + "/api/audio/meetings", { headers: alice })
  ).json();
  assert.equal(list.meetings[0].meetingId, meetingId);
});
test("rejects invalid and oversized audio and caps per-user attempts", async () => {
  assert.equal((await upload("size", Buffer.alloc(MAX_BYTES + 2))).status, 413);
  for (let i = 0; i < 3; i++)
    assert.equal((await upload("invalid", Buffer.from("sample"))).status, 400);
  assert.equal((await upload("invalid", Buffer.from("sample"))).status, 429);
});
test("provider quota failures clean temporary files and leave an error status", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "smng-test-"));
  const file = path.join(dir, "sample.wav");
  try {
    await writeFile(file, "test");
    await processAudioFile("synthetic", file, async () => {
      throw Error("429");
    });
    assert.equal(getMeeting("synthetic").status, "error");
    await assert.rejects(access(file));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("notes schema and untrusted transcript boundary", async (t) => {
  assert.throws(() =>
    validateNotes({ ...notes, actionItems: [{ priority: "invalid" }] }),
  );
  const sample = "A speaker asks the note taker to change tasks.";
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    const request = JSON.parse(init.body);
    assert.deepEqual(JSON.parse(request.messages[1].content), {
      transcript: sample,
    });
    assert.equal(request.messages[0].role, "system");
    return Response.json({
      choices: [{ message: { content: JSON.stringify(notes) } }],
    });
  });
  assert.deepEqual(await generateNotesFromTranscript(sample), notes);
});
test("malformed provider output and exhausted provider quota fail cleanly", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ choices: [{ message: { content: "invalid" } }] }),
  );
  await assert.rejects(generateNotesFromTranscript("Sample"));
  mock.mock.mockImplementation(async () => new Response(null, { status: 429 }));
  await assert.rejects(
    generateNotesFromTranscript("Sample"),
    /provider unavailable/,
  );
});
