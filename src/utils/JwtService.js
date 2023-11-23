import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default class JwtService {
    static sign(payload, expiry = '60s', secret = JWT_SECRET) {
        return jwt.sign(payload, secret, { expiresIn: expiry });
    }

    static verify(token, secret = JWT_SECRET) {
        return jwt.verify(token, secret);
    }
}