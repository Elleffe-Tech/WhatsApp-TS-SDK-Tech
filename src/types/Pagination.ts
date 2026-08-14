export type CursorPaging = {
  cursors?: {
    before?: string;
    after?: string;
  };
  previous?: string;
  next?: string;
};

export type CursorPage<T> = {
  data: T[];
  paging?: CursorPaging;
};
