export interface IPaginationOption {
  page: number;
  limit: number;
}

export const defaultPaginationOption = {
  page: 1,
  limit: 10,
} as const;
