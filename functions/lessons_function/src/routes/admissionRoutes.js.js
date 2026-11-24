
'use strict';

const express = require('express');
const router = express.Router();

const admissionController = require('../controllers/admissionController.js');

// Create admission
router.post('/', admissionController.create);

// Get all admissions
router.get('/', admissionController.list);

// Get admission statistics
router.get('/stats', admissionController.getStats);

// Find student by email
router.get('/email/:email', admissionController.getByEmail);

// Update admission status
router.patch('/:id/status', admissionController.updateStatus);

// Delete admission
router.delete('/:id', admissionController.remove);

module.exports = router;
