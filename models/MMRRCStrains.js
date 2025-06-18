const mongoose = require('mongoose');

const StrainCatalogSchema = 
    new mongoose.Schema({
        STRAINSTOCK_ID : String,
        STRAINSTOCK_DESIGNATION : String,
        STRAIN_TYPE : String,
        STATE : String,
        MUTATION_TYPE : String,
        CHROMOSOME : Number,
        MGI_GENE_ACCESSION_ID : String,
        GENE_SYMBOL : String,
        GENE_NAME : String,
        SDS_URL : String,
        ACCEPTED_DATE : String,
        PUBMED_IDS : String,
    }, { strict: false })

module.exports = mongoose.model('MMRRCStrains', StrainCatalogSchema);