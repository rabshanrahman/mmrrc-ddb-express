const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MmrrcGoMapping = sequelize.define('MmrrcGoMapping', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mmrrc_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        go_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'go_terms',
                key: 'go_id'
            }
        },
        mgi_id: {
            type: DataTypes.STRING(20)
        }
    }, {
        tableName: 'mmrrc_go_mapping',
        timestamps: false,
        underscored: false,
        indexes: [
            {
                fields: ['mmrrc_id']
            },
            {
                fields: ['go_id']
            },
            {
                fields: ['mgi_id']
            },
            {
                unique: true,
                fields: ['mmrrc_id', 'go_id']
            }
        ]
    });

    return MmrrcGoMapping;
};

