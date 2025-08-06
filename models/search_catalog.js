const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SearchCatalog = sequelize.define('SearchCatalog', {
        mmrrc_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        stock_id: {
            type: DataTypes.STRING(50)
        },
        strain_name: {
            type: DataTypes.STRING(500)
        },
        normalized_strain_name: {
            type: DataTypes.STRING(500)
        },
        mgi_ids: {
            type: DataTypes.TEXT
        },
        other_names: {
            type: DataTypes.TEXT
        },
        source_collection: {
            type: DataTypes.STRING(100)
        },
        alteration: {
            type: DataTypes.STRING(200)
        },
        mp_terms: {
            type: DataTypes.TEXT
        },
        mesh_terms: {
            type: DataTypes.TEXT
        },
        doid_terms: {
            type: DataTypes.TEXT
        },
        research_apps: {
            type: DataTypes.TEXT
        },
        pmids: {
            type: DataTypes.TEXT
        },
        gene_synonyms: {
            type: DataTypes.TEXT
        },
        availability: {
            type: DataTypes.STRING(50)
        },
        donor: {
            type: DataTypes.TEXT
        },
        is_available: {
            type: DataTypes.TINYINT,
            defaultValue: 1
        },
        np_only: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        }
    }, {
        tableName: 'search_catalog',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                fields: ['stock_id']
            },
            {
                fields: ['strain_name']
            },
            {
                fields: ['normalized_strain_name']
            },
            {
                fields: ['is_available']
            },
            {
                fields: ['source_collection']
            }
        ]
    });

    return SearchCatalog;
};