const express = require('express');
const mongoose = require('mongoose');
const strainRoutes = require('./routes/strainProcessor');
const jobRoutes = require('./routes/jobs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api', strainRoutes);
app.use('/api', jobRoutes);


mongoose.connect(process.env.MONGO_URI, 
    {
        socketTimeoutMS: 0,        // never time out
        keepAliveInitialDelay: 300000,
        maxIdleTimeMS: 300000, // 5 min idle timeout
        maxPoolSize: 10
    }
).then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('MongoDB connection error:', err));
