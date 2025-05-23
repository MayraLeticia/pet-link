const User = require('../models/userSchema');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transporter do nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Solicitar redefinição de senha
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'E-mail é obrigatório' });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      // Por segurança, não informamos se o e-mail existe ou não
      return res.status(200).json({ 
        message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.' 
      });
    }

    // Gerar token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Salvar token no usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // URL de redefinição de senha
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar e-mail
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@petlink.com',
      to: user.email,
      subject: 'Redefinição de Senha - Pet Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4d87fc;">Redefinição de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Pet Link.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4d87fc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Redefinir Senha</a>
          </div>
          <p>Se você não solicitou a redefinição de senha, ignore este e-mail e sua senha permanecerá a mesma.</p>
          <p>Este link é válido por 1 hora.</p>
          <p>Atenciosamente,<br>Equipe Pet Link</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.' 
    });

  } catch (error) {
    console.error('Erro ao processar solicitação de redefinição de senha:', error);
    return res.status(500).json({ message: 'Erro ao processar sua solicitação. Tente novamente mais tarde.' });
  }
};

// Verificar se o token de redefinição é válido
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token não fornecido' });
    }

    // Verificar se existe um usuário com este token e se ele ainda é válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    return res.status(200).json({ message: 'Token válido' });

  } catch (error) {
    console.error('Erro ao verificar token de redefinição:', error);
    return res.status(500).json({ message: 'Erro ao verificar token. Tente novamente mais tarde.' });
  }
};

// Redefinir senha
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }

    // Verificar se a senha tem pelo menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se existe um usuário com este token e se ele ainda é válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Atualizar senha e limpar tokens de redefinição
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ message: 'Erro ao redefinir senha. Tente novamente mais tarde.' });
  }
};
