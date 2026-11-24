'use strict';

const express = require('express');
require("dotenv").config();
const admissionRoutes = require('./src/routes/admissionRoutes.js');
const normalizeKeys = require('./src/middleware/nameing.middleware.js');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize request body keys
app.use(normalizeKeys);

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admission API is running successfully'
    });
});

// Routes
app.use('/api/admissions', admissionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

module.exports = app;