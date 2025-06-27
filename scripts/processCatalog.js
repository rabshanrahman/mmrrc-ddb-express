const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const db = require('../models');


const CHUNK_SIZE = 2000; // You can tune this

const runWorker = (chunk, jobId) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, './processCatalogWorker.js'), {
            workerData: { chunk, jobId }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};

const processCatalog = async (jobId) => {
    const job = await db.jobStatus.findById(jobId);
    if (!job) throw new Error('Job not found');

    try {
        console.log(`📖 Starting to Annotate the GO Collection By Indexing MMRRC -> MGI -> GO`);
        job.status = 'running';
        await job.save();

        const strainDocs = await db.strainCatalog.find({}, { _id: 1 }).lean();
        const strainIds = strainDocs.map(doc => doc._id.toString());
        const chunks = [];

        for (let i = 0; i < strainIds.length; i += CHUNK_SIZE) {
            chunks.push(strainIds.slice(i, i + CHUNK_SIZE));
        }

        job.total = strainIds.length;
        await job.save();

        const cpuCount = Math.min(os.cpus().length, 4);
        let processed = 0;

        while (chunks.length) {
            const activeChunks = chunks.splice(0, cpuCount);
            const results = await Promise.all(activeChunks.map(chunk =>
                runWorker(chunk, jobId)
            ));

            processed += results.reduce((sum, r) => sum + r.processed, 0);
            await db.jobStatus.findByIdAndUpdate(jobId, { processed });
        }

        job.status = 'completed';
        job.processed = processed;
        job.completedAt = new Date();
        await job.save();

        console.log(`✅ Processed ${processed} strain records.`);

    } catch (err) {
        job.status = 'error';
        job.error = err.message;
        job.completedAt = new Date();
        await job.save();
        console.error('❌ Error processing catalog:', err);
    }
};

module.exports = processCatalog;