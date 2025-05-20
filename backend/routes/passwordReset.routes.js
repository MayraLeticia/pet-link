const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Rota para solicitar redefinição de senha
router.post('/forgot-password', passwordResetController.forgotPassword);

// Rota para verificar se o token de redefinição é válido
router.get('/verify-reset-token/:token', passwordResetController.verifyResetToken);

// Rota para redefinir a senha
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;
