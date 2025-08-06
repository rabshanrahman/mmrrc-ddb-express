const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GoTermRelationship = sequelize.define('GoTermRelationship', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        parent_go_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'go_terms',
                key: 'go_id'
            }
        },
        child_go_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'go_terms',
                key: 'go_id'
            }
        },
        relation_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'is_a'
        }
    }, {
        tableName: 'go_term_relationships',
        timestamps: false,
        underscored: false,
        indexes: [
            {
                fields: ['parent_go_id']
            },
            {
                fields: ['child_go_id']
            },
            {
                unique: true,
                fields: ['parent_go_id', 'child_go_id', 'relation_type']
            }
        ]
    });

    return GoTermRelationship;
};