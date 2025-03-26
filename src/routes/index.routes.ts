import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import userRouter from './user.routes';
import authRouter from './auth.routes';
import calendarRouter from './calendar.routes';
import eventRouter from './event.routes';
import tagRouter from './tag.routes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res
    .status(StatusCodes.OK)
    .json({ message: 'Hello ma friend. Check other useful rotes.' });
});

router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/calendar', calendarRouter);
router.use('/event', eventRouter);
router.use('/tags', tagRouter);

export { router };
