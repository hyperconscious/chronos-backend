import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';
import { ForbiddenError, UnauthorizedError } from '../utils/http-errors';

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('No token provided.');
  }

  const jwtService = new JWTService();
  jwtService.verifyAccessToken(token);
  req.user = jwtService.getUserFromToken(token, 'access');
  next();
}

export function authorizeUser(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const jwtService = new JWTService();
      jwtService.verifyAccessToken(token);
      req.user = jwtService.getUserFromToken(token, 'access');
    } catch (err) {
      req.user = undefined;
    }
  }
  next();
}
