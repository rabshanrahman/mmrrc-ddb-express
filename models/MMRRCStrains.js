const mongoose = require('mongoose');

const StrainCatalogSchema = 
    new mongoose.Schema({
        STRAINSTOCK_ID : String,
        STRAINSTOCK_DESIGNATION : String,
        OTHER_NAMES : String, 
        STRAIN_TYPE : String,
        STATE : String,
        MGI_ALLELE_ACCESSION_ID : String,
        ALLELE_SYMBOL : String,
        ALLELE_NAME : String,
        MUTATION_TYPE : String, 
        CHROMOSOME : mongoose.Schema.Types.Mixed, 
        MGI_GENE_ACCESSION_ID : String,
        GENE_SYMBOL : String,
        GENE_NAME : String,
        SDS_URL : String,
        ACCEPTED_DATE : String,
        MPT_IDS: String,
        PUBMED_IDS : String,
        RESEARCH_AREAS: String
    }, { 
        strict: false,
        timestamps: true
    })

module.exports = mongoose.model('mmrrcStrains', StrainCatalogSchema, 'strain-catalog');