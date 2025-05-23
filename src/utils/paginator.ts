import { Filters, QueryOptions } from '../dto/query-options.dto';
export class Paginator<T> {
  private queryOptions: QueryOptions;

  constructor(paginationOptions: QueryOptions) {
    this.queryOptions = {
      page: paginationOptions.page || 1,
      limit: paginationOptions.limit,
      sortField: paginationOptions.sortField || 'id',
      sortDirection: paginationOptions.sortDirection || 'ASC',
      filters: paginationOptions.filters || {},
      search: paginationOptions.search || '',
      searchType: paginationOptions.searchType || 'userName',
    };
  }

  public async paginate(
    queryBuilder: any,
  ): Promise<{ items: T[]; total: number }> {
    Object.keys(this.queryOptions.filters || {}).forEach((filterKey) => {
      const filterValue = (this.queryOptions.filters ?? {})[
        filterKey as keyof Filters
      ];

      if (filterKey === 'dateRange' && typeof filterValue === 'string') {
        const [startDate, endDate] = filterValue
          .split(',')
          .map((date) => date.trim());
        queryBuilder.andWhere('publishDate BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      } else if (Array.isArray(filterValue)) {
        queryBuilder.andWhere(`${filterKey} IN (:...${filterKey})`, {
          [filterKey]: filterValue,
        });
      } else {
        queryBuilder.andWhere(`${filterKey} = :${filterKey}`, {
          [filterKey]: filterValue,
        });
      }
    });

    if (this.queryOptions.search) {
      const searchTerm = this.queryOptions.search.toString();
      if (this.queryOptions.searchType === 'userName') {
        queryBuilder.andWhere(
          'user.login LIKE :searchTerm OR user.full_name LIKE :searchTermFull',
          {
            searchTermFull: `%${searchTerm}%`,
            searchTerm: `${searchTerm}%`,
          },
        );
      } else if (this.queryOptions.searchType === 'userMail') {
        queryBuilder.andWhere('user.email LIKE :searchTerm', {
          searchTerm: `${searchTerm}%`,
        });
      } else if (this.queryOptions.searchType === 'tag') {
        queryBuilder.andWhere('tag.name LIKE :searchTerm', {
          searchTerm: `${searchTerm}%`,
        });
      } else if (this.queryOptions.searchType === 'event') {
        queryBuilder.andWhere('event.title LIKE :searchTerm', {
          searchTerm: `${searchTerm}%`,
        });
      } else if (this.queryOptions.searchType === 'calendar') {
        queryBuilder.andWhere('calendar.title LIKE :searchTerm', {
          searchTerm: `${searchTerm}%`,
        });
      }

    }

    const total = await queryBuilder.getCount();
    queryBuilder.orderBy(
      this.queryOptions.sortField,
      this.queryOptions.sortDirection,
    );


    if (this.queryOptions.limit > 0) {
      queryBuilder
        .limit(this.queryOptions.limit)
        .offset((this.queryOptions.page - 1) * this.queryOptions.limit);
    }

    const items = await queryBuilder.getMany();
    return { items, total: total };
  }
}
export { QueryOptions };
