interface IPaginationQueryArgs<T> {
  skip?: number;
  take?: number;
  cursor?: { id: T };
  orderBy?: Record<string, any>;
}
