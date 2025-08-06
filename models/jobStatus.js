const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const JobStatus = sequelize.define('JobStatus', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobType: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM('pending', 'running', 'completed', 'error'),
            defaultValue: 'pending'
        },
        total: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        processed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        written: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        error: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        startedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        completedAt: {
            type: DataTypes.DATE
        },
        workerErrors: {
            type: DataTypes.JSON
        }
    }, {
        tableName: 'job-status',
        timestamps: true,
        underscored: false
    });

    return JobStatus;
};