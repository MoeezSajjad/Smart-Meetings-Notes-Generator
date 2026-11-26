# Security and deployment audit

## Scope

Reviewed the public repository and draft PR #1, including both lockfiles, the Express request path, Firebase verification, upload handling, background jobs, storage, browser state, deployment files and older instructions. The canonical local repository in OneDrive Documents was clean on main at 752c385. The API source in the separate C-drive copy matched main. Other Desktop copies had edits in six backend and two frontend source files. They were left in place. Development started from the draft PR head 50937fa in a separate checkout so its ownership checks, retention, upload limits and CI work were preserved.

## Findings and disposition

| Severity | Finding | Change or remaining limit |
|---|---|---|
| Critical | Backend dependency remediation initially still reported one critical npm advisory. | Updated multipart and server dependencies and applied the compatible transitive fix. The follow-up backend audit reported zero known advisories. |
| High | The original app trusted browser-stored meeting data; device users could see stale records. | The API now lists records by verified Firebase UID. A direct request for another user's ID returns 404. The frontend uses the server as its meeting source. |
| High | Legacy code contained a placeholder authentication middleware. The PR's verifier mixed a provider account lookup with its own claim parsing. | Removed the unused placeholder. Verify Firebase RS256 signatures with Google's rotating public keys, then issuer, audience, time claims and UID. The live production allowlist requires a verified email. |
| High | Uploads relied on user-supplied type and extension. Multipart limits could reject valid requests. Crash leftovers and upstream errors could leave data behind. | A disk-backed parser limits size and part counts; check the container header before processing. Use generated filenames, bounded provider calls, finally cleanup and a stale-file sweep. Header checks do not fully decode media. Groq handles decoding. |
| Medium | A retired free-tier model and unvalidated model JSON could break the meeting view or silently substitute a fabricated fallback. | Use a model listed for the tested Groq account. Validate summary, points and tasks. Display a failure when output is malformed. |
| Medium | A transcript could include instructions directed at the summarizer. | Put instructions in the system message and transcript text in a serialized data object. Treat returned values as plain text, validate the schema and give the model no tools. Review all generated facts; these measures cannot guarantee factual accuracy. |
| Medium | Raw provider errors, client-controlled text and request details could enter logs. | Client responses and processing errors are generic. No request body, token, transcript or provider response logging in the active backend. |
| Medium | An unrestricted public inference endpoint would consume quota. | Require authentication, restrict production live access, and enforce 3 upload attempts per user and 12 per process per hour. An invalid attempt counts. |
| Medium | Meetings and jobs are transient. | Document one-instance deployment, one-hour expiry and restart loss. The public sample operates independently. Persistent storage would also require a retention policy, access rules and deletion handling. |
| Low | Earlier documentation mixed placeholder endpoints, superseded providers and unsupported product claims. | Consolidated supported endpoints and guides. Former entry points link to the current documentation. |

## Credential review

Scanned reachable Git history for real environment filenames, private-key markers, Groq and GitHub token patterns, Firebase service-account filenames and Google API-key patterns. No matches were found by that scan. This is a bounded pattern check. Original local credentials and recordings were excluded from the work branch. Verified Git ignores local environment files and upload paths. The local C-drive Groq credential returned 401. A separate Desktop backend credential returned 200 for the official model list and included both configured models. Neither credential value was printed or added to the repository. No repository exposure requiring rotation was identified.

Firebase web configuration identifies a client project and is distributed to browsers when live mode is enabled. The backend verifies tokens using public signing keys. No private service-account key is needed. Whoever controls the project should restrict API keys appropriately and review Firebase usage. Previously issued Firebase tokens may remain valid until expiration after an account is disabled; immediate revocation checks are outside this demo's verifier.

## Test evidence

| Test | Result | Boundary |
|---|---|---|
| Backend startup, production port and health | Passed | Spawned the real entry point with synthetic configuration. Missing production allowlist rejected. |
| Firebase registration, password sign-in and ID-token verification | Passed live | Created two disposable test identities in the configured Firebase project. Both reached the real verifier and returned API list HTTP 200. Both identities were deleted. |
| Route authorization and account isolation | Passed locally | Real Express requests, signed synthetic JWTs and two UIDs. Other owner received 404 and an empty list. Missing/expired/wrong-audience tokens and unverified production-style access were rejected. |
| Upload, list, poll, transcript, summary and task result | Passed with provider doubles | Multipart request exercised disk handling and the API response contract. |
| Invalid audio, oversize, quota and cleanup | Passed locally | Invalid signature and over-25-MB file rejected. Per-user excess returned 429. Failed processing removed the temporary file. |
| Provider exhaustion, bad JSON, schema and instruction boundary | Passed with provider doubles | Upstream 429 and malformed output rejected. Verified separation of system instructions and transcript data. No intentional live quota exhaustion. |
| Backend npm security audit | Passed | Zero reported advisories after lockfile remediation. |
| Groq model availability | Passed live | Both model IDs returned by the authenticated models endpoint. |
| Live transcription and notes | Passed live, local API | Synthesized a fictional support handover on Windows. A real Firebase user uploaded it (201), the second user received 404, polling reached ready and Groq returned a transcript, summary and two action items. Both temporary accounts were deleted. |
| Public frontend | Passed live | Opened the fictional sample at its public HTTPS URL in Chrome, switched to the transcript and downloaded the notes. |
| Frontend tests and dependency audit | Passed | Three frontend tests passed. The production Vite build completed and npm reported zero known advisories. |
| Hosted API | Awaiting runtime credential | Railway login succeeded and the Node 22 Docker image built remotely. The service has an HTTPS domain and a production allowlist. The first health check returned 502 while the required Groq secret was missing. |

Run `npm ci && npm test && npm audit` inside backend. The API regression suite needs no real credentials. For a live functional test, sign in with a verified allowlisted Firebase account, upload a short synthetic recording that explicitly states one action item, wait for ready, inspect the transcript and download the notes. The [deployment guide](DEPLOYMENT.md) includes exact host settings and expected responses.

## Residual operating limits

The app sends recording content to Groq. Use synthetic audio for public demonstrations. Data disappears on restart. Multiple instances would have independent stores and quotas; deploy one instance. Long or noisy recordings can fail even within the byte limit; a transcript above 100,000 characters is rejected. Container signatures are a basic format check, and provider availability, free quotas, model behavior and cold starts are external dependencies.

The hosted sample also passed Chrome layout checks at 320, 390, 768 and 1440 CSS pixels. Summary, transcript, key points and action items opened at each width with no horizontal overflow. The screenshots in docs/ contain fictional sample content. The GitHub Actions push and pull request checks passed for the reviewed application code.
