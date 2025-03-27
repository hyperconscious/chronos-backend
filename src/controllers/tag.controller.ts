import { Request, Response } from 'express';
import { TagService } from '../services/tag.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/http-errors';
import { StatusCodes } from 'http-status-codes';
import { createTagDto, updateTagDto } from '../dto/tag.dto';
import { queryOptionsDto, validateQueryDto } from '../dto/query-options.dto';
import { CalendarService } from '../services/calendar.service';
import { UserRole } from '../entities/userInCalendar.entity';

export class TagController {
    private static tagService = new TagService();
    private static calendarService = new CalendarService();

    public static async getAllTags(req: Request, res: Response) {
        const queryOptions = validateQueryDto(req.query);
        const tags = await TagController.tagService.getAllTags(queryOptions);
        return res.status(StatusCodes.OK).json(tags);
    }

    public static async getTagById(req: Request, res: Response) {
        const tagId = parseInt(req.params.id, 10);

        if (!tagId) {
            throw new BadRequestError('Tag ID is required');
        }

        const tag = await TagController.tagService.getTagById(tagId);

        if (!tag) {
            throw new NotFoundError('Tag not found');
        }

        return res.status(StatusCodes.OK).json(tag);
    }

    public static async createTag(req: Request, res: Response) {

        if(req.body.calendarId === undefined) {
            throw new BadRequestError('Calendar ID is required');
        }
        const calendar = await TagController.calendarService.getCalendarById(req.body.calendarId);
        const data = {
            name: req.body.name,
            description: req.body.description? req.body.description : '',
            color: req.body.color
        }
        const tagDto = await createTagDto.validateAsync(data);
        const newTag = await TagController.tagService.createTag(tagDto, calendar);
        return res.status(StatusCodes.CREATED).json(newTag);
    }

    public static async updateTag(req: Request, res: Response) {
        const tagId = parseInt(req.params.id, 10);

        if (!tagId) {
            throw new BadRequestError('Tag ID is required');
        }

        const tagDto = await updateTagDto.validateAsync(req.body);

        const existingTag = await TagController.tagService.getTagById(tagId);

        if (!existingTag) {
            throw new NotFoundError('Tag not found');
        }

        const updatedTag = await TagController.tagService.updateTag(tagId, tagDto);
        return res.status(StatusCodes.OK).json(updatedTag);
    }

    public static async deleteTag(req: Request, res: Response) {
        if (!req.user) {
            throw new BadRequestError('You need to be logged in.');
        }

        const tagId = parseInt(req.params.id, 10);

        if (!tagId) {
            throw new BadRequestError('Tag ID is required');
        }

        const tag = await TagController.tagService.getTagById(tagId);

        if (!tag) {
            throw new NotFoundError('Tag not found');
        }
        const UserInCalendar = await TagController.calendarService.checkUser(tag.calendar.id, req.user.id);

        if(!UserInCalendar || (
            UserInCalendar.role !== UserRole.owner &&
            UserInCalendar.role !== UserRole.admin &&
            UserInCalendar.role !== UserRole.editor))
        {
            throw new ForbiddenError('You are not allowed to delete this tag.');
        }

        await TagController.tagService.deleteTag(tagId);
        return res.status(StatusCodes.NO_CONTENT).json();
    }
}
