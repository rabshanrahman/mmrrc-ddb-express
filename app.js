const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import models and database connections
const db = require('./models');

// Import routes
const goRoutes = require('./routes/go');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', goRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await db.searchCatalogDb.authenticate();
        await db.mmrrcMgiDb.authenticate();
        res.status(200).json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            databases: {
                searchCatalog: 'connected',
                mmrrcMgi: 'connected'
            }
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler - must be last middleware
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Initialize database connections and start server
const initializeApp = async () => {
    try {
        // Test database connections
        await db.testConnections();
        
        // Sync models with database (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('Syncing database models...');
            await db.searchCatalogDb.sync({ alter: false });
            await db.mmrrcMgiDb.sync({ alter: false });
            console.log('Database models synced successfully.');
        }
        
        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    try {
        await db.searchCatalogDb.close();
        await db.mmrrcMgiDb.close();
        console.log('Database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    try {
        await db.searchCatalogDb.close();
        await db.mmrrcMgiDb.close();
        console.log('Database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Initialize the application
initializeApp();
