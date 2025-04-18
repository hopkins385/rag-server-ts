import type { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.hostname, req.path, { headers: req.headers }, { body: req.body });
  next();
};
