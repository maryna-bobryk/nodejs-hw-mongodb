import { Router } from 'express';
import {
  createContactsController,
  deleteContactsController,
  getContactByIdController,
  getContactsController,
  patchContactsController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

export const contactsRouter = Router();

contactsRouter.get('/contacts', ctrlWrapper(getContactsController));

contactsRouter.get(
  '/contacts/:contactId',
  ctrlWrapper(getContactByIdController),
);

contactsRouter.post('/contacts', ctrlWrapper(createContactsController));

contactsRouter.delete(
  '/contacts/:contactId',
  ctrlWrapper(deleteContactsController),
);

contactsRouter.patch(
  '/contacts/:contactId',
  ctrlWrapper(patchContactsController),
);
