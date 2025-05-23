const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const changePasswordController = require('../controllers/changePasswordController');

// Rota para solicitar redefinição de senha
router.post('/forgot-password', passwordResetController.forgotPassword);

// Rota para verificar se o token de redefinição é válido
router.get('/verify-reset-token/:token', passwordResetController.verifyResetToken);

// Rota para redefinir a senha
router.post('/reset-password', passwordResetController.resetPassword);

// Rota para alterar senha (usuário logado)
router.post('/change-password', changePasswordController.changePassword);

module.exports = router;
