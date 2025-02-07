export interface IPaginationOption {
  page: number;
  limit?: number;
}

export const defaultPaginationOption = {
  page: 1,
  limit: 10,
} as const;

export const QUERY_FIELD_NAME = {
  CURSOR: 'csr',
  LIMIT: 'lm',
  DIRECTION: 'dr',
  PAGE: 'p',
} as const;

export const QUERY_FIELD_DOC = {
  PAGE: 'Provide a page number for pagination.',
};

export const SORT_DIRECTION = {
  ASCENSION: 'asc',
  DESCENSION: 'desc',
} as const;

export interface ISortOption {
  field: string;
  direction: (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];
}

export enum PAGINATION_DIRECTION {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
}
