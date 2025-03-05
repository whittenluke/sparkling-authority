# Schema Roadmap

## Completed Changes

- Multiple Container Types

  - [x] Created separate product_containers table
  - [x] Migrated existing container data
  - [x] Flexible container_type and container_size fields

- Product Lines
  - [x] Added product_line column to products table
  - [x] Allows for sub-brands (e.g., Polar Jr.)
  - [x] Null = default product line

## Critical Requirements

- World-Class Search Implementation

  - [ ] Full text search for exact matches
  - [ ] Fuzzy matching for typos (e.g., "Grepe" finds "Grape")
  - [ ] Frontend search caching for performance
  - [ ] Type-ahead suggestions
  - [ ] Search across:
    - [ ] Product names
    - [ ] Flavors
    - [ ] Brands
    - [ ] Product lines
  - [ ] Proper indexes for fast queries
  - [ ] Relevance scoring

- Data Validation & Constraints
  - [ ] Standardize flavor names
  - [ ] Container type validation
  - [ ] Container size format standards
  - [ ] Product line naming conventions

## Nice-to-Have Improvements

- Data Relationships

  - [ ] Review foreign key constraints
  - [ ] Check for missing indexes
  - [ ] Verify cascade behaviors

- Performance Optimization

  - [ ] Monitor query performance
  - [ ] Add materialized views if needed
  - [ ] Consider table partitioning

- Data Integrity
  - [ ] Add validation triggers
  - [ ] Implement audit logging
  - [ ] Set up backup strategies

## Remaining Issues

- Search & Filtering

  - Optimize indexes for common search patterns
  - Consider adding full-text search capabilities
  - Handle product line grouping in search results

- Data Relationships
  - Review if any tables need additional foreign keys
  - Check if any junction tables are needed
  - Verify cascade delete behaviors

## Future Considerations

- Performance

  - Monitor query performance with larger datasets
  - Add materialized views if needed
  - Consider partitioning for large tables

- Data Integrity
  - Add triggers for data validation
  - Consider audit logging
  - Backup strategies
