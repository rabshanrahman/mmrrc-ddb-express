const db = require('../models');

const processCatalog = async (jobId) => {
    const job = await db.jobStatus.findById(jobId);
    if (!job) throw new Error('Job not found');
    
    try {
        job.status = 'running';
        await job.save();

        const totalDocs = await db.strainCatalog.countDocuments();
        job.total = totalDocs;
        await job.save();

        const cursor = db.strainCatalog.find().cursor();

        let processed = 0;
        let writeCount = 0;
        let errorLog = [];
        
        for await (let strain of cursor) {
            const geneAccessionId = strain.MGI_GENE_ACCESSION_ID;
            const strainStockId = strain.STRAINSTOCK_ID;

            if (!geneAccessionId || !strainStockId){
                processed++;
                await db.jobStatus.findByIdAndUpdate(jobId, { processed });
                continue;
            };

            const annotations = await db.MGI.find({ 'DB_Object_ID': geneAccessionId});

            for (let annotation of annotations) {
                const goId = annotation.GO_ID;
                if (!goId) continue;

                await db.GO.updateOne(
                    { id : `http://purl.obolibrary.org/obo/GO_${goId.slice(3)}`},
                    { $addToSet: { 'mmrrcStrains': strainStockId } }
                );
                writeCount++;
            }

            processed++;
            if (processed % 100 === 0) {
                await db.jobStatus.findByIdAndUpdate(jobId, { processed });
            };
        };

        job.status = 'completed';
        job.processed = processed;
        job.completedAt = new Date();
        await job.save();

        console.log(`Strain catalog processing complete.`);
        console.log(`✍️ ${writeCount} writes`)
    } catch(error) {
        job.status = 'error';
        job.error = error.message;
        job.completedAt = new Date();
        await job.save();
        console.error('Error in processing strain catalog:', error);
    }
};

module.exports = processCatalog;