export const collectionQuery = async (model, options = {}) => {
  const {
    filter = {},
    page = 1,
    limit = 30,
    sort = { createdAt: -1 },
    select = null,
    populate = null,
    lean = true,
  } = options;

  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 30));
  const skip = (validPage - 1) * validLimit;

  const [data, totalCount] = await Promise.all([
    (() => {
      let query = model.find(filter);
      if (select) query = query.select(select);
      if (populate) query = query.populate(populate);
      if (lean) query = query.lean();
      return query.sort(sort).skip(skip).limit(validLimit);
    })(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / validLimit);
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  return {
    data,
    summary: {
      totalCount,
      totalPages,
      currentPage: validPage,
      limit: validLimit,
      hasNextPage,
      hasPrevPage,
    },
  };
};

export const buildCacheKey = (baseKey, params = {}) => {
  const { page = 1, limit = 30, sort, filter } = params;
  const sortKey = sort ? JSON.stringify(sort) : "default";
  const filterKey = filter ? JSON.stringify(filter) : "none";
  return `${baseKey}:p${page}:l${limit}:s${sortKey}:f${filterKey}`;
};
