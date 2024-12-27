export interface IPaginationOption {
  page: number;
  limit: number;
}

export const defaultPaginationOption = {
  page: 1,
  limit: 10,
} as const;

export const QUERY_FIELD_NAME = {
  CURSOR: 'cursor',
} as const;
