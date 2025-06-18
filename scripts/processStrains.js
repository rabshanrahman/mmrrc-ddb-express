const db = require('../models');

const processCatalog = async () => {
    try {
        const cursor = await db.strainCatalog.find().cursor();
        
        for (let strain of cursor) {
            const geneAccessionId = strain.MGI_GENE_ACCESSION_ID;
            const strainStockId = strain.STRAINSTOCK_ID;

            if (!geneAccessionId || !strainStockId) continue;

            const annotations = await db.MGI.find({ 'DB_Object_ID': geneAccessionId});

            for (let annotation of annotations) {
                const goId = annotation.GO_ID;
                if (!goId) continue;

                
            }
        }
    }
    catch(e) {

    }
};