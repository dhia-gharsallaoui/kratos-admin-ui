# Kratos Admin UI

## Overview

A modern, responsive admin interface for Ory Kratos identity management and Ory Hydra OAuth2 server. Built with Next.js 14 (App Router), Material-UI v7, TypeScript, and React Query for state management. The application provides comprehensive identity lifecycle management, session monitoring, OAuth2 client management, and analytics dashboards.

**Key Purpose**: Provide administrators with a secure, user-friendly interface to manage Ory Kratos identities, sessions, schemas, and Ory Hydra OAuth2 clients, consent sessions, and tokens.

**Current Phase**: Active development with mock authentication (not production-ready).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15.5.2 with App Router architecture
- **App Directory Structure**: Organized into `(app)` and `(auth)` route groups for clean separation
- **Server Components**: Leverages React 19 Server Components where possible
- **Client Components**: Uses 'use client' directive for interactive components
- **Code Splitting**: Lazy loading with React.lazy() for performance optimization
- **Turbopack**: Enabled for faster development builds

**UI Framework**: Material-UI v7 (MUI)
- **Theme System**: Custom theming with light/dark mode support via ThemeProvider
- **Component Library**: Extensive use of MUI components (DataGrid, Charts, Icons)
- **Styling Approach**: Emotion for CSS-in-JS, Tailwind CSS v4 for utility classes
- **Responsive Design**: Mobile-first with MUI breakpoints

**State Management Strategy**:
- **Server State**: TanStack React Query v5 for API data fetching, caching, and synchronization
- **Client State**: Zustand for lightweight local state (auth, settings)
- **Form State**: React Hook Form v7 for performant form handling
- **Query Devtools**: Enabled in development for debugging

**Key Design Patterns**:
- **Feature-Based Organization**: Code organized by domain (identities, sessions, analytics, auth, etc.)
- **Custom Hooks**: Encapsulate business logic and API interactions
- **Protected Routes**: Role-based access control with ProtectedRoute component
- **Provider Pattern**: Nested providers for Query, Theme, Auth, and MUI
- **Skeleton Loading**: LoadingSkeleton and DottedLoader for better UX
- **Reusable UI Components**: Modern, theme-aware components (DataTable, Form components, MetricCard, ChartCard, Spinner)

**Reusable Component Library**:
- **Button**: Modern, theme-aware button component with 5 variants
  - primary: Dark button with white text (main actions)
  - secondary: Light button with subtle border (secondary actions)
  - outlined: Transparent button with border (tertiary actions)
  - text: Borderless text button (minimal actions)
  - danger: Red button for destructive actions
  - Clean styling with no shadows, consistent padding, smooth transitions
  - Used throughout app for consistent button appearance
- **DataTable**: Feature-rich table component with search, filters, pagination, sorting support
  - Clean design with `elevation={0}` and theme-aware borders
  - Sticky headers, customizable columns, row click handlers
  - Empty states, loading skeletons, responsive layout
- **Form Components**: Consistent form building blocks
  - FormContainer: Form wrapper with submit handling
  - FormSection: Card-based form sections with titles and descriptions
  - FormField: Styled text input with theme-aware borders
  - FormSelect: Dropdown with consistent styling
  - FormActions: Sticky action bar for submit/cancel buttons
- **MetricCard**: Dashboard metric display with colored left border accent
- **ChartCard**: Consistent container for charts and visualizations
- **Spinner**: Loading indicator with 3 variants (default, dots, pulse)

### Backend Integration

**API Proxying**: Next.js middleware proxies requests to avoid CORS issues
- `/api/kratos` → Kratos Public API
- `/api/kratos-admin` → Kratos Admin API
- `/api/hydra` → Hydra Public API
- `/api/hydra-admin` → Hydra Admin API

**Why Proxying?**: 
- Eliminates CORS configuration complexity
- Protects direct API access
- Enables environment-specific configuration
- Maintains consistent API paths across environments

**Client Libraries**:
- `@ory/kratos-client` v1.3.8 - Official Kratos TypeScript SDK
- `@ory/hydra-client` v2.4.0-alpha.1 - Official Hydra TypeScript SDK
- Custom service layer wraps SDK for consistent error handling

**Error Handling Strategy**:
- Custom HTTP client with retry logic and exponential backoff
- HttpError, NetworkError, TimeoutError custom error classes
- Centralized logger utility for environment-aware logging
- ErrorBoundary components for graceful error recovery

### Authentication & Authorization

**Current Implementation**: Mock authentication (development only)
- Username/password stored in-memory
- Two roles: ADMIN (full access) and VIEWER (read-only)
- JWT-like token stored in localStorage
- AuthProvider handles authentication state and redirects

**Planned**: Secure authentication module for production use

**Authorization Model**:
- Role-based access control (RBAC)
- ProtectedRoute component enforces permissions
- Page-level and feature-level protection
- Redirect to /login for unauthenticated users
- Redirect to /dashboard for unauthorized access

### Data Management

**Identity Schemas**: 
- Dynamic form generation using react-jsonschema-form (@rjsf)
- Support for multiple schema types (person, organizational, customer)
- JSON Schema validation with Ajv8
- Custom field widgets for phone numbers (libphonenumber-js)

**Pagination Strategy**:
- Kratos uses link-based pagination with page_token
- Custom pagination utilities parse Link headers
- Infinite scroll pattern with "Load More" buttons
- Search queries fetch all results for client-side filtering

**Caching Strategy**:
- React Query manages all server state caching
- 5-minute stale time for most queries
- Automatic background refetching
- Manual refetch via refresh buttons
- Optimistic updates for mutations

### Analytics & Visualization

**Charting Library**: MUI X-Charts v8.6.0
- **Chart Types**: LineChart (trends), PieChart (distribution), Gauge (metrics)
- **Data Processing**: Client-side aggregation and transformation
- **Performance**: Memoized calculations with useMemo

**Analytics Features**:
- Identity growth tracking (30-day trends)
- Session analytics (7-day activity)
- Schema distribution analysis
- OAuth2 client statistics
- System health monitoring

### Development & Build

**TypeScript Configuration**:
- Strict mode enabled for type safety
- Path aliases (@/* for src/*)
- ES2017 target for modern features
- Next.js plugin for enhanced type checking

**Build Configuration**:
- Standalone output for optimized Docker deployments
- Package import optimization for MUI libraries
- Image domains whitelisted for Next.js Image
- PostCSS with Tailwind v4

**Development Tools**:
- ESLint for code quality
- Prettier for consistent formatting
- TypeScript compiler for type checking
- React Query Devtools for debugging

**Docker Support**:
- Development compose with source mounting
- Production compose with pre-built images
- Multi-service setup (Kratos, Hydra, MailSlurper)
- Health checks and service dependencies

## External Dependencies

### Core Identity & OAuth2 Services

**Ory Kratos** (Identity Management)
- **Purpose**: Identity and user management backend
- **Integration**: REST API via official TypeScript SDK
- **Endpoints Used**: 
  - Admin API (port 4434): Identity CRUD, session management, recovery
  - Public API (port 4433): Health checks, metadata
- **Configuration**: Environment variables for endpoint URLs
- **Key Features**: Multi-schema support, email verification, password recovery

**Ory Hydra** (OAuth2 & OpenID Connect)
- **Purpose**: OAuth2 authorization server and OpenID Connect provider
- **Integration**: REST API via official TypeScript SDK
- **Endpoints Used**:
  - Admin API (port 4445): Client management, consent/login flows, token introspection
  - Public API (port 4444): OIDC discovery, JWKS, token exchange
- **Configuration**: Environment variables for endpoint URLs
- **Key Features**: OAuth2 client management, consent sessions, token lifecycle

**MailSlurper** (Email Testing - Development Only)
- **Purpose**: Local SMTP server for testing email flows
- **Ports**: 4436 (SMTP), 4437 (Web UI)
- **Use Case**: Verify recovery emails, verification links in dev environment

### Third-Party Libraries

**UI & Visualization**:
- Material-UI v7 (@mui/material, @mui/icons-material, @mui/x-data-grid, @mui/x-charts)
- Emotion for CSS-in-JS styling
- React Syntax Highlighter for JSON/code display
- Tailwind CSS v4 for utility-first styling

**State & Data Management**:
- TanStack React Query v5 for server state
- Zustand v5 for client state
- React Hook Form v7 for forms
- Axios v1 for HTTP requests

**Form & Validation**:
- @rjsf suite for JSON Schema forms (v6.0.0-beta)
- Ajv8 for JSON Schema validation
- libphonenumber-js for phone validation

**Utilities**:
- jwt-decode for token parsing (mock auth)
- next (15.5.2) for framework
- react (19.1.0) and react-dom (19.1.0)

### Configuration Management

**Environment Variables** (expected):
- `KRATOS_PUBLIC_URL`: Kratos public API endpoint
- `KRATOS_ADMIN_URL`: Kratos admin API endpoint
- `HYDRA_PUBLIC_URL`: Hydra public API endpoint
- `HYDRA_ADMIN_URL`: Hydra admin API endpoint
- `BASE_PATH`: Optional base path for deployment
- `NODE_ENV`: Environment (development/production)

**Settings Store** (Zustand):
- Persists endpoint URLs to localStorage
- Allows runtime configuration via Settings page
- Falls back to environment variables
- Validates URLs before saving

**API Configuration**:
- Separate server-side and client-side configs
- Server uses environment variables directly
- Client uses middleware proxy paths
- Singleton pattern for API client instances

### Deployment Considerations

**Current State**: Docker Compose for local development and testing

**Not Included** (requires setup):
- Production authentication system
- Database (Kratos/Hydra manage their own)
- Reverse proxy/load balancer
- SSL/TLS certificates
- Production environment variables
- Secrets management
- Monitoring/logging infrastructure

**Security Notes**:
- Mock authentication is NOT production-ready
- Admin UI should never be publicly exposed
- Requires secure network isolation in production
- Environment variables should be securely managed
- Consider OAuth2/OIDC integration for production auth