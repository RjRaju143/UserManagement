import { randomBytes, scrypt } from 'crypto';

/**
 * Hash a password using scrypt.
 * 
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to an object containing the salt and the hashed password.
 */
export const hashPassword = (password: string): Promise<{ salt: string, hashedPassword: string }> => {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) return reject(err);
            resolve({
                salt,
                hashedPassword: derivedKey.toString('hex')
            });
        });
    });
}

export const verifyPassword = async (storedPassword: string, storedSalt: string, inputPassword: string) => {
    return new Promise<boolean>((resolve, reject) => {
        scrypt(inputPassword, storedSalt, 64, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(storedPassword === derivedKey.toString('hex'));
        });
    });
}

