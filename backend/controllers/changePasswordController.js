const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

// Controlador para alteração de senha
exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validar dados de entrada
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Todos os campos são obrigatórios: userId, currentPassword, newPassword'
      });
    }

    // Verificar se a senha tem pelo menos 6 caracteres
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar o usuário pelo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Gerar hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar a senha do usuário
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({
      message: 'Erro ao alterar senha. Tente novamente mais tarde.'
    });
  }
};
