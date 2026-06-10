export const successResponse = (
  res,
  data,
  message = 'Success',
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const paginatedResponse = (res, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    pagination,
  });
};

export const errorResponse = (
  res,
  code,
  message,
  details = {},
  statusCode = 400,
) => {
  return res.status(statusCode).json({
    status: 'error',
    code,
    message,
    details,
  });
};

export const createdResponse = (
  res,
  data,
  message = 'Resource created successfully',
) => {
  return res.status(201).json({
    status: 'success',
    message,
    data,
  });
};

export const noContentResponse = (res) => {
  return res.status(204).send();
};

export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
