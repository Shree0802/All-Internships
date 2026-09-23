class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      const keyword = {
        $or: [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } },
          { category: { $regex: this.queryString.search, $options: 'i' } },
        ],
      };
      this.query = this.query.find(keyword);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['search', 'sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering for price, rating etc (e.g. price[gte]=100)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let parsedQuery = JSON.parse(queryStr);

    if (parsedQuery.category && parsedQuery.category !== 'All') {
      parsedQuery.category = parsedQuery.category;
    } else {
      delete parsedQuery.category;
    }

    this.query = this.query.find(parsedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
