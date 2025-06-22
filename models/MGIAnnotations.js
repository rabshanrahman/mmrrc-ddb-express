const mongoose = require('mongoose');

const MGIAnnotationSchema = 
    new mongoose.Schema({
        DB : String,
        DB_Object_ID : String,
        DB_Object_Symbol : String,
        Relation : String,
        GO_ID : String,	
        DB_Reference : String,	
        Evidence_Code : String,	
        With_or_From : String,	
        Aspect : String,
        DB_Object_Name : String,
        DB_Object_Synonym : String,	
        DB_Object_Type : String,
        Taxon : String,
        Date : Number,	
        Assigned_By : String,
        Annotation_Extension : String,
        Gene_Product_Form_ID : String
    }, { strict: false });

module.exports = mongoose.model('MGIAnnotations', MGIAnnotationSchema, 'mgi-annotations');