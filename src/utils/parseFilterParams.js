const parseIsFavourite = (favourite) => {
  if (typeof favourite === 'string') {
    if (favourite === 'true') return true;
    if (favourite === 'false') return false;
  }
  return undefined;
};

const parseContactType = (type) => {
  if (typeof type === 'string') {
    const allowedTypes = ['work', 'home', 'personal'];
    if (allowedTypes.includes(type)) {
      return type;
    }
  }
  return undefined;
};

export const parseFilterParams = (query) => {
  const { isFavourite, type } = query;

  return {
    isFavourite: parseIsFavourite(isFavourite),
    contactType: parseContactType(type),
  };
};
