import { Repository } from 'typeorm';
import { BadRequestError, NotFoundError } from '../utils/http-errors';
import { Tag } from '../entities/tag.entity';
import { AppDataSource } from '../config/orm.config';
import { createTagDto, updateTagDto } from '../dto/tag.dto';
import { Paginator, QueryOptions } from '../utils/paginator';

export const enum ServiceMethod {
  create,
  update,
}

export class TagService {
  private tagRepository: Repository<Tag>;

  constructor() {
    this.tagRepository = AppDataSource.getRepository(Tag);
  }

  private validateTagDTO(tagData: Partial<Tag>, method: ServiceMethod) {
    const dto = method === ServiceMethod.create ? createTagDto : updateTagDto;
    const { error } = dto.validate(tagData, { abortEarly: false });

    if (error) {
      throw new BadRequestError(
        error.details.map((detail) => detail.message).join('; '),
      );
    }
  }

  public async createTag(tagData: Partial<Tag>): Promise<Tag> {
    this.validateTagDTO(tagData, ServiceMethod.create);

    const newTag = this.tagRepository.create(tagData);

    const existingTag = await this.tagRepository.findOne({
      where: { name: newTag.name },
    });

    if (existingTag) {
      throw new BadRequestError('Tag already exists.');
    }

    return this.tagRepository.save(newTag);
  }

  public async updateTag(id: number, tagData: Partial<Tag>): Promise<Tag> {
    this.validateTagDTO(tagData, ServiceMethod.update);

    const tag = await this.getTagById(id);

    const updatedTag = this.tagRepository.merge(tag, tagData);

    return this.tagRepository.save(updatedTag);
  }

  public async getTagById(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOneBy({ id });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return tag;
  }

  public async getTagByName(name: string): Promise<Tag | null> {
    return await this.tagRepository.findOneBy({ name });
  }

  public async getAllTags(
    queryOptions: QueryOptions,
  ): Promise<{ items: Tag[]; total: number }> {
    queryOptions.searchType = 'tag';
    queryOptions.sortField = queryOptions.sortField || 'createdAt'; // Default to sorting by createdAt
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');
    const paginator = new Paginator<Tag>(queryOptions);
    return await paginator.paginate(queryBuilder);
  }

  public async deleteTag(id: number): Promise<boolean> {
    try {
      const tag = await this.getTagById(id);
      await this.tagRepository.remove(tag);
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw new Error('Unable to delete tag due to existing dependencies.');
    }
  }
}

