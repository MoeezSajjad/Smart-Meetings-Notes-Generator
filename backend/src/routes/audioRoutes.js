import { randomUUID } from "node:crypto";
import { Router } from "express";
import { authenticate, uploadQuota } from "../middlewares/requireUser.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { processAudioFile } from "../services/processingService.js";
import {
  getMeeting,
  storeMeeting,
  listMeetings,
  metadata,
} from "../services/storageService.js";

export function audioRoutes({
  project,
  allowed,
  verify,
  processFile = processAudioFile,
}) {
  const router = Router();
  router.use(authenticate(project, allowed, verify));
  router.get("/meetings", (req, res) =>
    res.json({ meetings: listMeetings(req.user.uid) }),
  );
  router.post("/upload", uploadQuota(), uploadMiddleware, (req, res) => {
    const meetingId = randomUUID();
    const meeting = {
      meetingId,
      ownerUid: req.user.uid,
      originalFileName: req.file.originalname.slice(0, 180),
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    };
    storeMeeting(meetingId, meeting);
    void processFile(meetingId, req.file.path);
    res.status(201).json({ success: true, data: metadata(meeting) });
  });
  router.get("/status/:meetingId", (req, res) => {
    const meeting = getMeeting(req.params.meetingId);
    if (!meeting || meeting.ownerUid !== req.user.uid)
      return res.status(404).json({ error: "Meeting not found" });
    res.json({
      ...metadata(meeting),
      data: {
        transcript: meeting.transcript || null,
        notes: meeting.notes || null,
        error:
          meeting.status === "error"
            ? "Processing failed. Check the recording or try again later."
            : null,
      },
    });
  });
  return router;
}
