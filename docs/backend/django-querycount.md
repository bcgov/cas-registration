# django-querycount

## Overview

`django-querycount` is a Django middleware that helps developers track the number of database queries executed per request. This package is particularly useful for optimizing database performance and identifying inefficient query patterns.

## Features

- Logs the total number of database queries for each request.
- Provides detailed query information in the Django console.
- Helps identify N+1 query issues and excessive database calls.

## Usage

To enable `django-querycount`, add it to the `MIDDLEWARE` setting in your Django project's settings file:

```python
MIDDLEWARE = [
    ...
    'querycount.middleware.QueryCountMiddleware',
    ...
]
```

> **Note:** This package is hardcoded to be used only when `DEBUG = True`. It will not function in production environments where `DEBUG` is `None`.

## Configuration

You can customize `django-querycount` behavior by adding the following configuration to your Django settings:

```python
QUERYCOUNT = {
    'THRESHOLDS': {
        'MEDIUM': 50,  # Number of queries considered a medium load
        'HIGH': 200,  # Number of queries considered a high load
        'MIN_TIME_TO_LOG': 0,  # Minimum execution time (in ms) before a query is logged
        'MIN_QUERY_COUNT_TO_LOG': 0  # Minimum number of queries before logging starts
    },
    'IGNORE_REQUEST_PATTERNS': [],  # List of request paths to exclude from logging
    'IGNORE_SQL_PATTERNS': [],  # List of SQL queries to ignore from logging
    'DISPLAY_DUPLICATES': None,  # If set, controls how duplicate queries are displayed
    'RESPONSE_HEADER': 'X-DjangoQueryCount-Count'  # Custom header to display query count in responses
}
```

### Explanation of Configuration Options

- **`THRESHOLDS`**: Defines the limits for medium and high query loads.
  - `MEDIUM`: The number of queries at which a request is considered to have a medium query load.
  - `HIGH`: The number of queries at which a request is considered to have a high query load.
  - `MIN_TIME_TO_LOG`: Only logs queries that take longer than this threshold (in milliseconds).
  - `MIN_QUERY_COUNT_TO_LOG`: Logs queries only if the total number reaches this threshold.
- **`IGNORE_REQUEST_PATTERNS`**: A list of URL patterns for which query counting should be ignored.
- **`IGNORE_SQL_PATTERNS`**: A list of SQL query patterns that should be excluded from logs.
- **`DISPLAY_DUPLICATES`**: Determines how duplicate queries should be displayed. If set, duplicate queries will be grouped accordingly.
- **`RESPONSE_HEADER`**: Allows setting a custom HTTP response header that includes the query count.

## More Information

For more details and configuration options, refer to the official GitHub repository:

[django-querycount on GitHub](https://github.com/bradmontgomery/django-querycount)
