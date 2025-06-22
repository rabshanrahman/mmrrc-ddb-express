const mongoose = require('mongoose');

const GOBasicSchema = 
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
        mmrrcStrains : [String]
    }, { strict: false });

module.exports = mongoose.model('GOBasic', GOBasicSchema, 'go-basic');