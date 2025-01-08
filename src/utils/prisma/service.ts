import { Prisma } from '@prisma/client';
import { NullAble } from '@utils/types/common.type';
import {
  defaultPaginationOption,
  IPaginationOption,
} from 'src/common/types/pagination.type';

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

/**
 *
 * @param param
 * @return
 *
 * Function for creating
 * prisma query
 */
export function generatePaginationQueryOption<S extends object, T>({
  paginationOption,
  cursor,
  sortOption,
}: {
  paginationOption?: NullAble<IPaginationOption>;
  cursor?: NullAble<T>;
  sortOption?: NullAble<S>;
}): IPaginationQueryArgs<T> {
  let query: IPaginationQueryArgs<T> = {};
  if (sortOption && Object.keys(sortOption).length > 0) {
    const [property, method] = Object.entries(sortOption)[0];
    query['orderBy'] = {
      [property]: method,
    };
  }
  if (cursor) {
    query = {
      ...query,
      cursor: { id: cursor },
      skip: 1,
      take: paginationOption?.limit || defaultPaginationOption.limit,
    };
  } else {
    const paginationPage = paginationOption?.page
      ? (paginationOption?.page - 1) * paginationOption?.limit
      : (defaultPaginationOption.page - 1) * defaultPaginationOption.limit;
    query = {
      ...query,
      skip: paginationPage,
      take: paginationOption?.limit ?? defaultPaginationOption.limit,
    };
  }
  return query;
}
