import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { auth } from '../middlewares/auth.middleware';

const tagRouter = Router();

tagRouter.get('/', auth, TagController.getAllTags);
tagRouter.get('/:id', auth, TagController.getTagById);

tagRouter.post('/', auth, TagController.createTag);

tagRouter.patch('/:id', auth, TagController.updateTag);

tagRouter.delete('/:id', auth, TagController.deleteTag);

export default tagRouter;