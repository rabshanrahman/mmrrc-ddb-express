const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const db = require('../models');

(async () => {
    const { chunk, jobId } = workerData;

    let processed = 0;
    let written = 0;

    try{
        await mongoose.connect(process.env.MONGO_URI,
            {
                socketTimeoutMS: 0,        // never time out
                keepAliveInitialDelay: 300000, // 5 minutes
                maxIdleTimeMS: 300000, // 5 min idle timeout
                maxPoolSize: 4
            }
        )
    } catch (err) {
        console.error('❌ Worker failed to connect to MongoDB: ', err);
        process.exit(1);
    }

    try {
        let bulkOps = []
        for (const _id of chunk) {
            try {
                const strain = await db.strainCatalog.findById(_id).lean();
                const geneAccessionId = strain.MGI_GENE_ACCESSION_ID;
                const strainURL = strain.SDS_URL;

                if (!geneAccessionId || !strainURL) {
                    processed++;
                    continue;
                }

                const annotations = await db.mgi.find({ DB_Object_ID: geneAccessionId }).lean();

                for (const a of annotations) {
                    if (!a.GO_ID) continue;

                    bulkOps.push({
                        updateOne: {
                            filter: { id: `http://purl.obolibrary.org/obo/GO_${a.GO_ID.slice(3)}` },
                            update: { $addToSet: { mmrrcStrains: strainURL } }
                        }
                    });
                }

                if (bulkOps.length >= 500) {
                    await db.go.bulkWrite(bulkOps);
                    written += bulkOps.length;
                    bulkOps = [];
                }

                processed++;

                // Periodically update job progress (e.g., every 10 strains)
                if (processed % 100 === 0) {
                    await db.jobStatus.findByIdAndUpdate(jobId, {
                        $inc: { processed: 100 },
                    });
                }

                if (written % 100 === 0) {
                    await db.jobStatus.findByIdAndUpdate(jobId, {
                        $inc: { written: 100 }
                    });
                }

            } catch (strainErr) {
                // Log individual strain processing error
                await db.jobStatus.findByIdAndUpdate(jobId, 
                    {$push: { workerErrors: { strainId: _id, message: strainErr.message } }
                });
            }
        }
        if (bulkOps.length > 0) await db.go.bulkWrite(bulkOps);
        bulkOps=[];

        // Final progress update
        await db.jobStatus.updateOne(
            {_id: jobId}, 
            {$inc: { processed: processed % 10 }
        });

        parentPort.postMessage({ processed });
        await mongoose.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (workerErr) {
        // Worker-level error logging
        await db.jobStatus.findByIdAndUpdate(jobId,
            {$push: { workerErrors: { message: 'Worker failed', detail: workerErr.message } }
        });
        parentPort.postMessage({ processed, error: workerErr.message });
    }
})();