const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GoTerm = sequelize.define('GoTerm', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        go_id: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false,
            field: 'go_id'
        },
        name: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        namespace: {
            type: DataTypes.STRING(50)
        },
        definition: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'go_terms',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                unique: true,
                fields: ['go_id']
            },
            {
                fields: ['name']
            },
            {
                fields: ['namespace']
            }
        ]
    });

    return GoTerm;
};