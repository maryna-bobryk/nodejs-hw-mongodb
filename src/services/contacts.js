import { SORT_ORDER } from '../constants/sortOrder.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (typeof filter.isFavourite !== 'undefined') {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const contactsCount = await ContactsCollection.countDocuments(
    contactsQuery.getQuery(),
  );

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload) => {
  const { _id: userId } = payload.user;
  const contact = await ContactsCollection.create({ ...payload, userId });
  return contact;
};

export const updateContact = async (
  contactId,
  userId,
  payload,
  options = {},
) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      ...options,
    },
  );

  if (!updatedContact) return null;
  return {
    contact: updatedContact,
    isNew: Boolean(updatedContact?.lastErrorObject?.upserted),
  };
};

export const deleteContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};
