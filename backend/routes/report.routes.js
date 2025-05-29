const express = require('express');
const router = express.Router();
const Report = require('../models/reportSchema');
const mongoose = require('mongoose');

// Criar denúncia
router.post('/', async (req, res) => {
  try {
    const { reportedBy, contentType, contentId, reason, details } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contentId) || !mongoose.Types.ObjectId.isValid(reportedBy)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    const newReport = new Report({
      reportedBy,
      contentType,
      contentId,
      reason,
      details
    });

    const saved = await newReport.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar denúncia.' });
  }
});

// Listar todas as denúncias (acesso restrito a admin futuramente)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('reportedBy');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar denúncias.' });
  }
});

// Atualizar status de uma denúncia
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!report) return res.status(404).json({ error: 'Denúncia não encontrada.' });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar denúncia.' });
  }
});

module.exports = router;
