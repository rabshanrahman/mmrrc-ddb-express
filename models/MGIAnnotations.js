const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MGIAnnotation = sequelize.define('MGIAnnotation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        DB: {
            type: DataTypes.STRING
        },
        DB_Object_ID: {
            type: DataTypes.STRING
        },
        DB_Object_Symbol: {
            type: DataTypes.STRING
        },
        Relation: {
            type: DataTypes.STRING
        },
        GO_ID: {
            type: DataTypes.STRING
        },
        DB_Reference: {
            type: DataTypes.STRING
        },
        Evidence_Code: {
            type: DataTypes.STRING
        },
        With_or_From: {
            type: DataTypes.STRING
        },
        Aspect: {
            type: DataTypes.STRING
        },
        DB_Object_Name: {
            type: DataTypes.STRING
        },
        DB_Object_Synonym: {
            type: DataTypes.STRING
        },
        DB_Object_Type: {
            type: DataTypes.STRING
        },
        Taxon: {
            type: DataTypes.STRING
        },
        Date: {
            type: DataTypes.INTEGER
        },
        Assigned_By: {
            type: DataTypes.STRING
        },
        Annotation_Extension: {
            type: DataTypes.STRING
        },
        Gene_Product_Form_ID: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'mgi-annotations',
        timestamps: false,
        underscored: false
    });

    return MGIAnnotation;
};