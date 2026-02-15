import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { AssemblyAI } from 'assemblyai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const port = 3000;

// Check if uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Simple file logger
function log(msg, error = null) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg} ${error ? (error.stack || error) : ''}\n`;
    console.log(msg, error || '');
    try {
        fs.appendFileSync('server.log', logMsg);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

// Global error handlers
process.on('uncaughtException', (err) => {
    log('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection at:', promise);
});


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure storage to preserve file extensions
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // preserve original extension
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});

// In-memory job store (replace with DB in production)
const jobs = {};

// Endpoint to upload and start transcription
app.post('/api/upload', (req, res) => {
    upload.single('audio')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            log('Multer error:', err);
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            log('Unknown upload error:', err);
            return res.status(500).json({ error: 'Unknown upload error' });
        }

        // Everything went fine.
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!process.env.ASSEMBLYAI_API_KEY) {
                return res.status(500).json({ error: 'AssemblyAI API Key not configured' });
            }

            const { path } = req.file;
            const jobId = Date.now().toString(); // Simple ID generation

            // Initialize job status
            jobs[jobId] = {
                status: 'processing',
                stage: 'uploading_to_service',
                createdAt: new Date(),
                filePath: path
            };

            // Start background processing (fire and forget)
            processBackgroundUpload(jobId, path);

            // Return immediately to prevent browser timeout
            res.json({ id: jobId, status: 'queued' });

        } catch (error) {
            log('Upload initiation error:', error);
            res.status(500).json({ error: 'Failed to start transcription' });
        }
    });
});

async function processBackgroundUpload(jobId, filePath) {
    try {
        log(`[${jobId}] Starting background upload for ${filePath}`);

        // 1. Upload file to AssemblyAI
        const uploadUrl = await client.files.upload(filePath);
        log(`[${jobId}] Uploaded to AssemblyAI`);

        // Delete the local file after upload to save space
        fs.unlink(filePath, (err) => {
            if (err) log(`[${jobId}] Error deleting file:`, err);
        });

        // 2. Submit transcription job
        const transcript = await client.transcripts.submit({
            audio: uploadUrl,
            // Use the modern Universal-2 model
            speech_models: ['universal-2'],
            summarization: true,
            summary_model: 'informative',
            summary_type: 'bullets',
            auto_highlights: true,
            speaker_labels: true,
            language_detection: true // Add language detection
        });

        log(`[${jobId}] Transcript submitted. ID: ${transcript.id}`);

        // Update job with transcript ID
        jobs[jobId].transcriptId = transcript.id;
        jobs[jobId].stage = 'transcribing';

    } catch (error) {
        log(`[${jobId}] Background processing error:`, error);
        jobs[jobId].status = 'error';
        jobs[jobId].error = error.message;
    }
}

// Endpoint to check status and get results
app.get('/api/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const localJob = jobs[id];

        if (!localJob) {
            log(`[${id}] Job not found`);
            return res.status(404).json({ error: 'Job not found' });
        }

        if (localJob.status === 'error') {
            return res.json({ status: 'error', error: localJob.error });
        }

        // If we don't have a transcript ID yet, we are still uploading
        if (!localJob.transcriptId) {
            return res.json({ status: 'processing', stage: localJob.stage });
        }

        // Check actual AssemblyAI status
        const transcript = await client.transcripts.get(localJob.transcriptId);

        if (transcript.status === 'completed') {
            log(`[${id}] Job completed`);
            // Generate a simple mind map structure from highlights
            let mindMap = [];
            const highlights = transcript.auto_highlights_result?.results || [];

            if (highlights.length > 0) {
                mindMap = [
                    { id: 'root', label: 'Main Topics', x: 50, y: 50 },
                    ...highlights.slice(0, 4).map((h, i) => ({
                        id: `h-${i}`,
                        label: h.text,
                        x: 20 + (i * 20),
                        y: 100 + (i % 2 * 30),
                        parent: 'root'
                    }))
                ];
            } else {
                // Fallback mind map if no highlights found
                mindMap = [
                    { id: 'root', label: 'Transcript Content', x: 50, y: 50 },
                    { id: '1', label: 'Summary', x: 30, y: 80, parent: 'root' },
                    { id: '2', label: 'Key Points', x: 70, y: 80, parent: 'root' },
                    { id: '3', label: 'Analysis', x: 50, y: 110, parent: 'root' }
                ];
            }

            // Format action items
            const actionItems = (transcript.auto_highlights_result?.results || []).slice(0, 3).map((h, i) => ({
                id: i,
                text: `Follow up on: ${h.text}`,
                owner: "Auto-assigned",
                status: "pending"
            }));

            // Mark local job as complete (optional cleanup could happen here)
            jobs[id].status = 'completed';

            res.json({
                status: 'completed',
                data: {
                    text: transcript.text,
                    summary: transcript.summary,
                    actionItems: actionItems.length > 0 ? actionItems : [
                        { id: 1, text: "Review transcript details", owner: "User", status: "pending" }
                    ],
                    mindMap: mindMap,
                    utterances: transcript.utterances
                }
            });
        } else if (transcript.status === 'error') {
            log(`[${id}] AssemblyAI Transcription error`, transcript.error);
            res.json({ status: 'error', error: transcript.error });
        } else {
            // log(`[${id}] Status: ${transcript.status}`); // Verbose
            res.json({ status: transcript.status }); // queued, processing
        }
    } catch (error) {
        log('Status check error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

const server = app.listen(port, () => {
    log(`Server running at http://localhost:${port}`);
});

// Set timeout to 0 (no timeout) to handle large file uploads being written to disk
server.timeout = 0;
server.keepAliveTimeout = 0;

setInterval(() => {
    // Keep alive heartbeat
}, 10000);
