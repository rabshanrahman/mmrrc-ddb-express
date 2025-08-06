const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const StrainImport = sequelize.define('StrainImport', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobId: {
            type: DataTypes.STRING
        },
        row: {
            type: DataTypes.INTEGER
        },
        strainStockId: {
            type: DataTypes.STRING
        },
        mgiAlleleAccessionId: {
            type: DataTypes.STRING
        },
        mgiGeneAccessionId: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'strain-import',
        timestamps: true,
        underscored: false
    });

    return StrainImport;
};