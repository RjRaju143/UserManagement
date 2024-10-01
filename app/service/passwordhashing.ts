import crypto from 'crypto';

export class PasswordService {
    static getPasswordHash(password: string) {
        const salt = crypto.randomBytes(16).toString("base64");
        return `${salt}$f$${crypto
            .pbkdf2Sync(password, Buffer.from(salt, "base64"), 10000, 64, "sha512")
            .toString("base64")}`;
    }

    static verifyPasswordHash(password: string, passwordHash: string) {
        if (!password || !passwordHash) {
            return false;
        }
        const [salt, hash] = passwordHash.split("$f$");
        const cHash = crypto
            .pbkdf2Sync(password, Buffer.from(salt, "base64"), 10000, 64, "sha512")
            .toString("base64");
        return cHash === hash;
    }
}


