const https = require('https');
const { Readable } = require('stream');
const csv = require('csv-parser');
const db = require('../models');

const CSV_URL = 'https://www.mmrrc.org/about/mmrrc_catalog_data.csv';
const BATCH_SIZE = 10;

const getLastImportedStrain = async () => {
    const latestImport = await db.strainImport.findOne().sort({ _id: -1 });
    if (latestImport) return latestImport;

    // fallback: query strain-catalog
    const lastDoc = await db.strainCatalog.findOne().sort({ _id: -1 });
    if (!lastDoc) return null;
    const rowCount = await db.strainCatalog.countDocuments({});

    return {
        jobId: null,
        row: rowCount,
        strainStockId: lastDoc.STRAINSTOCK_ID,
        mgiAlleleAccessionId: lastDoc.MGI_ALLELE_ACCESSION_ID,
        mgiGeneAccessionId: lastDoc.MGI_GENE_ACCESSION_ID
    };
};

const streamCSV = (url) => {
    return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch CSV: ${res.statusCode}`));
      }

      const customHeaders = [
        'STRAINSTOCK_ID',
        'STRAINSTOCK_DESIGNATION',
        'OTHER_NAMES',
        'STRAIN_TYPE',
        'STATE',
        'MGI_ALLELE_ACCESSION_ID',
        'ALLELE_SYMBOL',
        'ALLELE_NAME',
        'MUTATION_TYPE',
        'CHROMOSOME',
        'MGI_GENE_ACCESSION_ID',
        'GENE_SYMBOL',
        'GENE_NAME',
        'SDS_URL',
        'ACCEPTED_DATE',
        'MPT_IDS',
        'PUBMED_IDS',
        'RESEARCH_AREAS'
      ]
      resolve(res.pipe(csv({ headers: customHeaders, skipLines: 1 })));
    }).on('error', reject);
  });
};

const importStrains = async (jobId) => {
    const job = await db.jobStatus.findById(jobId);
    if (!job) throw new Error('Job not found');

    try {
        console.log(`📦 Importing Strains from MMRRC (${CSV_URL})`);
        console.time(`⏱️`);
        job.status = 'running';
        await job.save();

        const last = await getLastImportedStrain();
        let skipUntil = true;
        let currentRow = 0;
        let writeCount = 0;
        const batch = [];

        const csvStream = await streamCSV(CSV_URL);

        csvStream.on('data', async data => {
            currentRow++;

            if(last !== null && currentRow < last.row) return;

            if (skipUntil) {
                if (
                    data.STRAINSTOCK_ID === last.strainStockId &&
                    (data.MGI_ALLELE_ACCESSION_ID === last.mgiAlleleAccessionId ||
                    data.MGI_GENE_ACCESSION_ID === last.mgiGeneAccessionId)
                ) {
                    skipUntil = false; // begin importing from next row
                }
                return;
            }

            if (data._id) {
                console.warn('⚠️ Unexpected _id found on row:', data);
            }

            // Add to batch
            const cleanData = JSON.parse(JSON.stringify(data));
            delete cleanData._id;
            batch.push({
                insertOne: {
                    document: cleanData
                }
            });

            writeCount++;

            if (batch.length === BATCH_SIZE) {
                await db.strainCatalog.bulkWrite(batch);
                await db.strainImport.create({
                    jobId,
                    row: currentRow,
                    strainStockId: data.STRAINSTOCK_ID,
                    mgiAlleleAccessionId: data.MGI_ALLELE_ACCESSION_ID,
                    mgiGeneAccessionId: data.MGI_GENE_ACCESSION_ID
                });
                batch = [];
            }

            if (currentRow % 100 === 0) {
                await db.jobStatus.findByIdAndUpdate(jobId, {
                    $inc: { processed: 100 },
                });
            }

            if (writeCount % 100 === 0) {
                await db.jobStatus.findByIdAndUpdate(jobId, {
                    $inc: { written: 100 }
                });
            }
        });

        csvStream.on('end', async () => {
            if (batch.length > 0) {
                const lastRow = batch[batch.length - 1].insertOne.document;
                await db.strainCatalog.bulkWrite(batch);
                await db.strainImport.create({
                    jobId,
                    row: currentRow,
                    strainStockId: lastRow.STRAINSTOCK_ID,
                    mgiAlleleAccessionId: lastRow.MGI_ALLELE_ACCESSION_ID,
                    mgiGeneAccessionId: lastRow.MGI_GENE_ACCESSION_ID
                });
            }

            job.status = 'completed';
            job.processed = currentRow;
            job.written = writeCount;
            job.completedAt = new Date();
            await job.save();
            console.timeEnd(`⏱️`);
            console.log(`✅ Strain import job completed with ${writeCount}.`);
        });

        csvStream.on('error', err => {
            console.error('CSV stream error:', err);
        });
    }
    catch (err){
        job.status = 'error';
        job.error = err.message;
        job.completedAt = new Date();
        await job.save();
        console.error('❌ Error processing catalog:', err);
    }
    
};

module.exports = importStrains;