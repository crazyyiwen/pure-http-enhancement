# Pure-HTTP Project Analysis

## Project Structure

**pure-http** is a lightweight, zero-dependency web framework for Node.js with Express-like API. Here's the structure:

```
pure-http-enhancement/
├── index.js                    # Main entry point - exports pureHttp(), Router, Cache
├── index.d.ts                  # TypeScript definitions
├── package.json                # v4.0.2, Node.js 16+ required
├── README.md & API.md          # Documentation
│
├── lib/                        # Core framework (~1,088 lines)
│   ├── pure-http.js           # App factory, server creation
│   ├── router.js              # Routing engine with middleware chain
│   ├── cache.js               # LRU cache with TTL
│   ├── settings.js            # App settings management
│   ├── utils.js               # Path-to-regex utilities
│   ├── cookie.js              # Cookie serialization/signing
│   ├── mime.js                # MIME type detection
│   ├── mime-types.json        # MIME database
│   ├── etag.js                # ETag generation
│   └── extend/
│       ├── index.js           # Request/response extensions
│       ├── request.js         # Enhanced req object (protocol, query, params, etc.)
│       └── response.js        # Enhanced res object (send, json, redirect, render, etc.)
│
├── tests/                     # 16 test suites with Jest + supertest
│   ├── basic/                 # Server functionality
│   ├── router/                # Routing tests
│   ├── cache/                 # Cache tests
│   └── [others...]            # Cookie, error-handling, params, etc.
│
├── demos/                     # Working examples
│   ├── basic/                 # Simple servers
│   ├── router/                # Middleware examples
│   └── render/                # Template rendering
│
└── bench/                     # Performance benchmarks vs Express/Fastify
```

## Project Overview

### Project Purpose
**pure-http** is a lightweight, zero-dependency web framework for Node.js that brings Express-like middleware and routing capabilities to native Node.js HTTP servers. It emphasizes performance and simplicity, offering a familiar API while maintaining minimal overhead.

### Key Characteristics
- **Zero dependencies** - The entire framework is self-contained
- **High performance** - Benchmarks show it outperforms Express, Fastify, and TinyHTTP
- **Express-compatible API** - Familiar routing and middleware patterns
- **Minimal codebase** - Only ~1,088 lines of core code
- **Modern Node.js** - Requires Node.js 16+
- **TypeScript support** - Includes full type definitions

## Architecture & Components

### 1. Entry Point (`index.js`)
The main entry point exports:
- **pureHttp()** - Main factory function
- **pureHttp.Router()** - Router constructor
- **pureHttp.Cache()** - Cache constructor

### 2. Application Layer (`lib/pure-http.js`)
Creates an HTTP server that:
- Accepts existing HTTP/HTTPS server instances or creates new ones
- Attaches router methods (get, post, put, delete, etc.) to the server
- Sets up request listener that extends req/res and invokes router
- Provides settings management via `app.set()` and `app.get()`
- Supports view configuration for template rendering
- Integrates optional cache instance

### 3. Router System (`lib/router.js`)
A sophisticated routing engine that:
- **Path Matching**: Converts string/regex paths to patterns using `regexparam` algorithm
- **Route Methods**: Supports all HTTP verbs (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE, CONNECT)
- **Middleware Support**: Implements Express-style middleware chain with `next()`
- **Nested Routers**: Supports prefixed sub-routers
- **Parameter Extraction**: Extracts URL parameters (`:param`) and wildcards (`*`)
- **Error Handling**: 4-parameter error handlers `(err, req, res, next)`
- **Async-safe**: Uses `setImmediate`/`process.nextTick` for deferred execution

### 4. Request Enhancement (`lib/extend/request.js`)
Extends Node.js `IncomingMessage` with:
- `req.protocol` - http/https detection
- `req.secure` - TLS connection flag
- `req.hostname` - Extracted hostname
- `req.host` - Alias for hostname
- `req.port` - Connection port
- `req.path` - URL path
- `req.query` - Parsed query parameters
- `req.params` - Route parameters
- `req.body` - Request body (populated by middleware)
- `req.header()` - Header getter
- `req.app` - Reference to app instance

### 5. Response Enhancement (`lib/extend/response.js`)
Extends Node.js `ServerResponse` with:
- **`res.status(code)`** - Set status code
- **`res.header(name, value)`** - Set response header
- **`res.send(data, [options])`** - Smart response sender (detects type, handles streams, buffers, objects)
- **`res.json(data, [options])`** - JSON response
- **`res.jsonp(data, [options])`** - JSONP response
- **`res.redirect(url, [status])`** - Redirect response
- **`res.render(view, [options], [callback])`** - Template rendering
- **`res.cookie(name, value, [options])`** - Set cookie
- **`res.clearCookie(name, [options])`** - Clear cookie
- **`res.sendFile(path, [options])`** - Send file with proper MIME type
- **Automatic ETag generation** for caching
- **Response caching** integration

### 6. Cache System (`lib/cache.js`)
Simple but effective caching:
- **LRU-style**: Removes oldest entry when max size reached
- **TTL Support**: Optional time-based expiration
- **Stale Mode**: Can return expired values if configured
- **String keys only**: Optimized for URL-based caching
- Methods: `clear()`, `has()`, `get()`, `set()`, `delete()`

### 7. Utility Modules

**Path-to-Regex (`utils.js`):**
- Converts Express-style paths to regular expressions
- Supports named parameters (`:param`), optional parameters (`:param?`), and wildcards (`*`)
- Based on the `regexparam` library pattern

**Cookie Handling (`cookie.js`):**
- Cookie serialization with full options support
- Signed cookies using HMAC-SHA256

**MIME Type Detection (`mime.js`):**
- Determines MIME type from file extension
- Uses comprehensive MIME type database

**ETag Generation (`etag.js`):**
- Generates weak ETags using SHA1 hashing
- Supports both file stats and content-based tags

## Key Features

### 1. Zero Dependencies
The entire framework is self-contained with no external runtime dependencies. All necessary functionality (routing, MIME types, cookies, ETags) is implemented internally.

### 2. Express-Compatible API
Developers familiar with Express can use pure-http with minimal changes:
```javascript
const pureHttp = require('pure-http');
const app = pureHttp();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

### 3. Performance-Focused
- Minimal abstraction over native Node.js HTTP
- Efficient routing algorithm
- Optional response caching
- No unnecessary dependencies

### 4. Template Rendering Support
Flexible view engine integration:
```javascript
const app = pureHttp({
  views: {
    dir: './views',
    ext: 'ejs',
    engine: require('ejs').renderFile
  }
});
```

### 5. Advanced Routing
- Regular expression routes
- Named parameters
- Optional parameters
- Wildcard routes
- Route prefixes
- Nested routers

### 6. Middleware System
Full middleware chain support:
```javascript
app.use((req, res, next) => {
  console.log('Middleware');
  next();
});
```

### 7. Error Handling
Dedicated error handlers:
```javascript
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});
```

## Dependencies & Technologies

### Runtime
- **Zero production dependencies**
- Requires Node.js 16+
- Pure JavaScript (CommonJS modules)

### Development Tools
- **Testing**: Jest with supertest for HTTP testing
- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions
- **Coverage**: Coveralls integration
- **Benchmarking**: wrk load testing tool
- **Git Hooks**: Husky (pre-push testing)

### Type Definitions
Complete TypeScript definitions (`index.d.ts`) covering:
- All request/response interfaces
- Handler types
- Router interfaces
- Application options
- Cache interfaces

## Testing Strategy

The project uses comprehensive test-driven development:
- **16 test suites** covering all major features
- **Jest** as test runner with coverage reporting
- **Supertest** for HTTP integration testing
- Tests organized by feature domain
- Good coverage of edge cases and error conditions

## Performance Characteristics

Based on the benchmark data:
- **~6,349 req/sec** with cache (15.11ms latency)
- **~6,255 req/sec** without cache (15.39ms latency)
- Outperforms Express by ~2.8x
- Competitive with specialized frameworks like Fastify

## Recent Development

From git history:
- **Current version**: v4.0.2
- **Recent changes**:
  - v4.0.2: Latest release
  - Fixed method type issues
  - Added common types for TypeScript support
- **Active maintenance**: Regular updates and fixes

## Learning Steps

### Phase 1: Foundation (1-2 days)

1. **Read the documentation**
   - Start with `README.md` - understand what pure-http does
   - Review `API.md` - familiarize yourself with the API surface

2. **Run basic demos**
   - `demos/basic/` - See a simple server in action
   - `demos/router/` - Understand middleware and routing
   - Try modifying examples to see how they work

3. **Study the entry point**
   - Read `index.js:1-12` - Simple factory pattern
   - Understand what gets exported: `pureHttp()`, `Router`, `Cache`

### Phase 2: Core Concepts (2-3 days)

4. **Understand the application layer**
   - Read `lib/pure-http.js:1-60` - How apps are created
   - Notice how it wraps Node.js HTTP server
   - See how settings and view configuration work

5. **Study request/response extensions**
   - Read `lib/extend/request.js:1-74` - Enhanced request properties
   - Read `lib/extend/response.js:1-384` - Response methods (send, json, redirect, etc.)
   - These make pure-http feel like Express

6. **Run the tests**
   - `cd tests/basic && npm test` - See how tests work
   - Tests are great documentation for expected behavior

### Phase 3: Advanced Features (3-4 days)

7. **Deep dive into the router**
   - Read `lib/router.js:1-245` - The heart of the framework
   - Understand path-to-regex conversion in `lib/utils.js:1-84`
   - Study middleware chain execution and `next()` handling
   - Look at how route parameters are extracted

8. **Explore the cache system**
   - Read `lib/cache.js:1-80` - Simple LRU implementation
   - See how TTL and stale mode work
   - Run `tests/cache/` to understand usage

9. **Study utility modules**
   - `lib/cookie.js:1-65` - Cookie handling and signing
   - `lib/mime.js:1-25` - MIME type detection
   - `lib/etag.js:1-38` - ETag generation for caching

### Phase 4: Practice & Contribution (Ongoing)

10. **Build something with pure-http**
    - Create a simple REST API
    - Implement authentication middleware
    - Add template rendering with your preferred engine

11. **Read the test suite thoroughly**
    - Each test directory covers a specific feature
    - Tests show edge cases and proper usage patterns

12. **Compare with Express**
    - Notice the similar API but different internals
    - Understand the performance benefits (zero dependencies)
    - See benchmarks in `bench/` directory

13. **Explore advanced topics**
    - Error handling patterns
    - JSONP support
    - Cookie signing and security
    - Response caching strategies

## Quick Start Code

```javascript
const pureHttp = require('pure-http');
const app = pureHttp();

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/json', (req, res) => {
  res.json({ message: 'Pure HTTP!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Key Learning Goals

- Understand zero-dependency design patterns
- Learn Express-compatible middleware system
- Master the routing algorithm and path matching
- Study HTTP protocol handling and response optimization
- Explore caching strategies for performance
- Practice reading and understanding production-quality code

---

The codebase is clean, well-organized, and only ~1,088 lines - perfect for learning modern Node.js web framework design!
