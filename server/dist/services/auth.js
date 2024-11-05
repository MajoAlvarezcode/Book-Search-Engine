import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();
export const authenticateToken = ({ req }) => {
    // Verifica que req existe
    if (!req) {
        console.log("Request object is undefined");
        return {};
    }
    // Cambia de const a let para permitir la reasignación
    let token = req.body?.token || req.query?.token || req.headers?.authorization;
    if (req.headers.authorization) {
        token = token.split(' ').pop().trim();
    }
    // Si no hay token, simplemente retorna req sin lanzar error
    if (!token) {
        return req;
    }
    try {
        const { data } = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
        console.log("Decoded user data:", data);
        return { user: data };
    }
    catch (err) {
        console.error('Invalid token:', err);
        return {};
    }
};
export const signToken = (username, email, _id) => {
    const payload = { username, email, _id };
    const secretKey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};
export class AuthenticationError extends GraphQLError {
    constructor(message) {
        super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
        Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
    }
}
;
// import type { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();
// interface JwtPayload {
//   _id: unknown;
//   username: string;
//   email: string,
// }
// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (authHeader) {
//     const token = authHeader.split(' ')[1];
//     const secretKey = process.env.JWT_SECRET_KEY || '';
//     jwt.verify(token, secretKey, (err, user) => {
//       if (err) {
//         return res.sendStatus(403); // Forbidden
//       }
//       req.user = user as JwtPayload;
//       return next();
//     });
//   } else {
//     res.sendStatus(401); // Unauthorized
//   }
// };
// export const signToken = (username: string, email: string, _id: unknown) => {
//   const payload = { username, email, _id };
//   const secretKey = process.env.JWT_SECRET_KEY || '';
//   return jwt.sign(payload, secretKey, { expiresIn: '1h' });
// };
