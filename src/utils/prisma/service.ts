import { Prisma } from '@prisma/client';
// import { IPaginationOption } from 'src/common/types/pagination.type';

/**
 *
 * @param params
 * @param next
 * @returns {void}
 * Prisma middleware to change UTC timezone store in database
 * to local timezone
 */
export const utcToTimeZoneMiddleware: Prisma.Middleware = async (
  params: Prisma.MiddlewareParams,
  next,
) => {
  const result = await next(params);

  /**
   * Recusive through data of array to change all
   * of the Date instance to timezone
   */
  const convertDates = (data: unknown): unknown => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map(convertDates);
    }
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (data[key] instanceof Date) {
          data[key] = data[key].toLocaleString();
        } else if (Array.isArray(data[key]) && data[key].length > 0) {
          data[key] = data[key].map(convertDates);
        } else if (
          data[key] &&
          typeof data[key] === 'object' &&
          Object.keys(data[key]).length > 0
        ) {
          data[key] = convertDates(data[key]);
        }
      }
    }
    return data;
  };
  return convertDates(result);
};

// export const paginationQueryOption = ({
//   paginationOption,
// }: {
//   paginationOption?: IPaginationOption;
// }) => {};
