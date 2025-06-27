import { SORT_ORDER } from '../constants/sortOrder.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

// export const getAllContacts = async ({
//   page,
//   perPage,
//   sortOrder = SORT_ORDER.ASC,
//   sortBy = '_id',
//   filter = {},
// }) => {
//   const limit = perPage;
//   const skip = (page - 1) * perPage;

//   const contactsQuery = ContactsCollection.find(filter);
//   // const contactsCount = await ContactsCollection.find()
//   //   .merge(contactsQuery)
//   //   .countDocuments();
//   // const contacts = await contactsQuery
//   //   .skip(skip)
//   //   .limit(limit)
//   //   .sort({ [sortBy]: sortOrder })
//   //   .exec();

//   const [contactsCount, contacts] = await Promise.all([
//     ContactsCollection.countDocuments(filter),
//     ContactsCollection.find(filter)
//       .skip(skip)
//       .limit(perPage)
//       .sort({ [sortBy]: sortOrder })
//       .exec(),
//   ]);

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

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

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const result = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!result || !result.value) return null;
  return {
    contact: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};

export const deleteContactById = async (contactId) => {
  const contact = await ContactsCollection.findByIdAndDelete(contactId);
  return contact;
};
