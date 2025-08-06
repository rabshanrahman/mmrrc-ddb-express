const { Sequelize } = require('sequelize');
require('dotenv').config();

// Common database configuration
const getDbConfig = (host, port) => ({
    host: host || process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: port || process.env.DB_PORT || 3306,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    retry: {
        max: 3
    }
});

// Database connection to the database with the 'search_catalog' table
const searchCatalogDb = new Sequelize(
    process.env.DB_SEARCH_CATALOG || 'mmrrc_search_catalog',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    getDbConfig()
);

// Database connection to the mmrrc mgi database
const mmrrcMgiDb = new Sequelize(
    process.env.DB_MMRRC_MGI || 'mmrrc_mgi',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    getDbConfig()
);

// Test connections
const testConnections = async () => {
    try {
        await searchCatalogDb.authenticate();
        console.log('Search catalog database connection established successfully.');
        
        await mmrrcMgiDb.authenticate();
        console.log('MMRRC MGI database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to database:', error);
        process.exit(1);
    }
};

const db = {};

db.Sequelize = Sequelize;
db.searchCatalogDb = searchCatalogDb;
db.mmrrcMgiDb = mmrrcMgiDb;
db.testConnections = testConnections;

// Initialize models
try {
    db.searchCatalog = require('./search_catalog')(searchCatalogDb);
    db.goTerms = require('./go_terms')(mmrrcMgiDb);
    db.goTermRelationships = require('./go_term_relationships')(mmrrcMgiDb);
    db.mmrrcGoMapping = require('./mmrrc_go_mapping')(mmrrcMgiDb);
} catch (error) {
    console.error('Error initializing models:', error);
    process.exit(1);
}

// Define associations within the same database (mmrrc_mgi)
try {
    // GO Terms to GO Term Relationships
    db.goTerms.hasMany(db.goTermRelationships, {
        foreignKey: 'parent_go_id',
        sourceKey: 'go_id',
        as: 'childRelationships'
    });
    
    db.goTerms.hasMany(db.goTermRelationships, {
        foreignKey: 'child_go_id',
        sourceKey: 'go_id',
        as: 'parentRelationships'
    });
    
    db.goTermRelationships.belongsTo(db.goTerms, {
        foreignKey: 'parent_go_id',
        targetKey: 'go_id',
        as: 'parentTerm'
    });
    
    db.goTermRelationships.belongsTo(db.goTerms, {
        foreignKey: 'child_go_id',
        targetKey: 'go_id',
        as: 'childTerm'
    });
    
    // GO Terms to MMRRC GO Mapping
    db.goTerms.hasMany(db.mmrrcGoMapping, {
        foreignKey: 'go_id',
        sourceKey: 'go_id',
        as: 'mmrrcMappings'
    });
    
    db.mmrrcGoMapping.belongsTo(db.goTerms, {
        foreignKey: 'go_id',
        targetKey: 'go_id',
        as: 'goTerm'
    });
    
    // Note: Cross-database associations between mmrrcGoMapping and searchCatalog
    // cannot be defined with Sequelize associations due to different databases.
    // These relationships must be handled manually in queries.
    
} catch (error) {
    console.error('Error defining model associations:', error);
    process.exit(1);
}

module.exports = db;