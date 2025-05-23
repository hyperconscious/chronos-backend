import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { JWTService } from '../services/jwt.service';
import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/http-errors';
import { MailService } from '../services/mail.service';
import { User } from '../entities/user.entity';
import axios from 'axios';
import { CalendarService } from '../services/calendar.service';
import { getHolidays } from '../utils/holidays';
import { EventService } from '../services/event.service';
import { EventRecurrence, EventType } from '../entities/event.entity';
import { UserRole } from '../entities/userInCalendar.entity';

const isoCountries = require("i18n-iso-countries");
export class AuthController {
  private static userService = new UserService();
  private static jwtService = new JWTService();
  private static mailService = new MailService();
  private static calendarService = new CalendarService();
  private static eventService = new EventService();

  public static async register(req: Request, res: Response) {
    const {
      login,
      password,
      full_name,
      passwordConfirmation,
      email,
      countryCode,
    } = req.body;

    if (password !== passwordConfirmation) {
      throw new BadRequestError('Password confirmation does not match.');
    }

    if (!isoCountries.isValid(countryCode)) {
      throw new BadRequestError('Invalid country code.');
    }
    const holidays = await getHolidays(countryCode);

    const user = await AuthController.userService.createUser({
      login,
      password,
      full_name,
      email,
    });
    const accessToken = AuthController.jwtService.generateAccessToken(user);
    const refreshToken = AuthController.jwtService.generateRefreshToken(user);

    const calendar = await AuthController.calendarService.createCalendar({
      title: 'My Calendar',
    }, user.id);
    await AuthController.calendarService.addUserToCalendar(
      calendar.id,
      user.id,
      UserRole.owner
    );
    for (const holiday of holidays) {
      let startDate = new Date(holiday.date);
      let endDate = new Date(holiday.date);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 0, 0);

      let now = new Date();
      if (startDate < now) {
        startDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await AuthController.eventService.createEvent({
        title: holiday.name,
        description: 'It is a holiday!',
        startTime: startDate,
        endTime: endDate,
        recurrence: EventRecurrence.Yearly,
        type: EventType.Reminder
      }, user.id, calendar.id);
    }
    // const mailToken = AuthController.jwtService.generateEmailToken(user);
    // await AuthController.mailService.sendVerificationEmail(
    //   user.email,
    //   mailToken,
    //   req.headers['x-callback-url'] as string,
    // );

    return res.status(StatusCodes.CREATED).json({ accessToken, refreshToken });
  }

  public static async login(req: Request, res: Response) {
    const { loginOrEmail, password } = req.body;
    const user = await AuthController.userService.validateUserCredentials(
      loginOrEmail,
      password,
    );

    if (!user) {
      throw new BadRequestError('Invalid login or password.');
    }

    if (!user.verified) {
      throw new UnauthorizedError('Email is not verified.');
    }

    const accessToken = AuthController.jwtService.generateAccessToken(user);
    const refreshToken = AuthController.jwtService.generateRefreshToken(user);

    return res.status(StatusCodes.OK).json({ accessToken, refreshToken });
  }

  public static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required.');
    }

    const userData = AuthController.jwtService.verifyRefreshToken(refreshToken);
    const user = await AuthController.userService.getUserById(userData.id);

    const newAccessToken = AuthController.jwtService.generateAccessToken(user);
    const newRefreshToken =
      AuthController.jwtService.generateRefreshToken(user);

    return res
      .status(StatusCodes.OK)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  }

  public static async sendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body;
    const callbackUrl = req.headers['x-callback-url'];

    if (!callbackUrl) {
      throw new BadRequestError('Callback URL is required.');
    }

    const user = await AuthController.userService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestError('User with this email does not exist.');
    }

    const mailToken = AuthController.jwtService.generateEmailToken(user);

    await AuthController.mailService.sendVerificationEmail(
      email,
      mailToken,
      callbackUrl as string,
    );

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Verification email sent successfully.' });
  }

  public static async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;

    if (!token) {
      throw new BadRequestError('Verification token is missing.');
    }

    const decoded = AuthController.jwtService.verifyEmailToken(token as string);

    const user = await AuthController.userService.getUserById(decoded.id);

    if (!user || user.verified) {
      throw new NotFoundError('User already verified or does not exist.');
    }

    await AuthController.userService.updateUser(user.id, { verified: true });

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Email verified successfully.' });
  }

  public static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const callbackUrl = req.headers['x-callback-url'];

    if (!callbackUrl) {
      throw new BadRequestError('Callback URL is required.');
    }

    let user: User;
    try {
      user = await AuthController.userService.getUserByEmail(email);
    } catch (error) {
      throw new BadRequestError('User with this email does not exist.');
    }

    const mailToken = AuthController.jwtService.generateEmailToken(user);

    await AuthController.mailService.sendPasswordResetEmail(
      email,
      mailToken,
      callbackUrl as string,
    );

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Password reset email sent successfully.' });
  }

  public static async resetPassword(req: Request, res: Response) {
    const { token } = req.query;
    const { password, passwordConfirmation } = req.body;

    if (!token) {
      throw new BadRequestError('Password reset token is missing.');
    }

    if (password && password !== passwordConfirmation) {
      throw new BadRequestError('Password confirmation does not match.');
    }

    const decoded = AuthController.jwtService.verifyEmailToken(token as string);

    const user = await AuthController.userService.getUserById(decoded.id);

    if (!user) {
      throw new BadRequestError('User does not exist.');
    }

    await AuthController.userService.updateUser(user.id, { password });

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Password reset successfully.' });
  }
}
