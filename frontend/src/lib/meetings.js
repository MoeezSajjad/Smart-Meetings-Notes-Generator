export const sample = {
  title: "Support handover",
  transcript:
    "Maya: Three customers wrote in about the same order confirmation error. I grouped the tickets and added their order times.\n\nSam: I’ll compare those times with the checkout logs this afternoon. Please leave the tickets open until we know what happened.\n\nMaya: I’ll send a short update to the customers before the end of the day.",
  notes: {
    summary:
      "The support team linked three reports of an order confirmation error. The tickets will stay open while the checkout logs are reviewed.",
    keyPoints: [
      "Three tickets describe the same symptom.",
      "Order times are available for comparison with checkout logs.",
      "Customers should receive an update today.",
    ],
    actionItems: [
      {
        task: "Compare the reported order times with the checkout logs this afternoon.",
        owner: "Sam",
      },
      {
        task: "Update the affected customers before the end of the day.",
        owner: "Maya",
      },
    ],
  },
};

export function checkAudio(file) {
  if (!file) return "Select a recording.";
  if (!/\.(mp3|wav|m4a)$/i.test(file.name))
    return "Select an MP3, WAV or M4A file.";
  if (!file.size) return "The selected file is empty.";
  if (file.size > 25_000_000) return "Choose a file no larger than 25 MB.";
  return "";
}

export function formatNotes({ title, notes, transcript }, isSample = false) {
  const tasks = notes.actionItems.map(
    (item) => "- " + (item.owner ? item.owner + " — " : "") + item.task,
  );
  return [
    title,
    isSample && "FICTIONAL SAMPLE MEETING",
    "Summary",
    notes.summary,
    "Key points",
    notes.keyPoints.map((p) => "- " + p).join("\n") || "None recorded.",
    "Action items",
    tasks.join("\n") || "None recorded.",
    "Transcript",
    transcript || "Unavailable.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function downloadNotes(meeting, isSample) {
  const url = URL.createObjectURL(
    new Blob([formatNotes(meeting, isSample)], {
      type: "text/plain;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = isSample
    ? "sample-support-handover.txt"
    : "meeting-notes.txt";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
