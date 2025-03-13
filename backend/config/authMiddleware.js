const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");

    try {
        console.log("Token recebido:", token);  // Adicionei isso para verificar se o token está correto
        const decoded = jwt.verify(token, '789237109234sfdadf'); // Sua chave secreta
        req.userId = decoded.sub; // O ID do usuário está no "sub"
        next();
    } catch (error) {
        console.log("Erro ao verificar o token:", error);  // Adicionei isso para depuração
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
};

module.exports = authMiddleware;
