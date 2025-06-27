const mongoose = require('mongoose');

const goBasicExtSchema = 
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
            sdsUrl : String,
            strainStockId : String,
            otherNames : String
        }]
    }, { 
        strict: false,
        timestamps: true
    });

module.exports = mongoose.model('goBasicExt', goBasicExtSchema, 'go-basic-ext');