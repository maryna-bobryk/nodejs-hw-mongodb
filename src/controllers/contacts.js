import createHttpError from 'http-errors';
import {
  createContact,
  deleteContactById,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFiles } from '../utils/saveFiles.js';

export const getContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const userId = req.user._id;
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contacts with id ${contactId}!`,
    data: contact,
  });
};

export const createContactsController = async (req, res, next) => {
  const photo = req.file;

  let photoUrl;
  if (photo) {
    try {
      photoUrl = await saveFiles(photo);
    } catch (error) {
      return next(createHttpError(500, 'Failed to save photo'));
    }
  }
  const contact = await createContact({
    ...req.body,
    user: req.user,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const patchContactsController = async (req, res, next) => {
  const { contactId } = req.params;
  const photo = req.file;

  let photoUrl;
  if (photo) {
    try {
      photoUrl = await saveFiles(photo);
    } catch (error) {
      return next(createHttpError(500, 'Failed to save photo'));
    }
  }

  const userId = req.user._id;
  const updateData = { ...req.body };

  if (photoUrl) {
    updateData.photo = photoUrl;
  }

  const result = await updateContact(contactId, userId, updateData);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const deleteContactsController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await deleteContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send();
};
