const crypto = require('crypto');

// Defina uma chave secreta de 32 bytes (256 bits)
const SECRET_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 caracteres

const ALGORITHM = 'aes-256-cbc'; 
const IV_LENGTH = 16; // AES precisa de um IV de 16 bytes

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Retorna o IV + a mensagem criptografada, codificado em base64
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
