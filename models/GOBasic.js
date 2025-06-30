const mongoose = require('mongoose');

const goBasicSchema = 
    new mongoose.Schema({
        id : String, 
        lbl : String,
        type : String,
        meta : {
            definition : {
                val : String, 
                xrefs : [String]
            },
            comments : [String],
            synonyms : [{
                pred : String,
                val : String
            }],
            basicPropertyValues : [{
                pred : String,
                val : String
            }],
            deprecated : Boolean
        },
        mmrrcStrains : [{
            otherNames: String,
            url: String
        }]
    }, { 
        strict: false,
        timestamps: true
    });

/*
goBasicSchema.virtual('strainDetails', {
    ref: 'mmrrcStrains',
    localField: 'mmrrcStrains',
    foreignField: 'SDS_URL'
})

goBasicSchema.set('toJSON', { virtuals: true });
goBasicSchema.set('toObject', { virtuals: true });
*/

module.exports = mongoose.model('goBasic', goBasicSchema, 'go-basic');