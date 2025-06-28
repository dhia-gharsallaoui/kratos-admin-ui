# Kratos Admin UI

A modern, responsive admin interface for [Ory Kratos](https://www.ory.sh/kratos/) identity management system. Built with Next.js 14, Material-UI v7, and TypeScript.

> **🚨 SECURITY WARNING**: This interface should **NOT** be exposed to the public internet. It uses mock authentication for development purposes and is **NOT secure for production use**. Always deploy behind proper authentication and access controls.

> **⚠️ Development Phase**: This project is currently in active development. Features may change and breaking updates can occur. We encourage testing and feedback, but recommend caution for production use.

> **🔐 Authentication Module**: A secure authentication module is planned for future releases. Contributions are welcome! Until then, please ensure this interface is only accessible in secure, private environments.

> **🐛 Found an Issue?** Please [open an issue](https://github.com/dhia-gharsallaoui/kratos-admin-ui/issues) on GitHub. Your feedback helps improve the project!

## ✨ Features

### 🎯 Core Pages & Functionality

- **📊 Analytics Dashboard**: Comprehensive metrics dashboard with interactive charts displaying:
  - Total users and growth trends
  - Active sessions and session analytics
  - Email verification rates
  - Identity schema distribution
  - System health monitoring
- **👥 Identity Management**: Complete user identity lifecycle management:
  - **Create Identities**: Dynamic form generation based on Kratos schemas with validation
  - **View Identities**: Searchable table with pagination and advanced filtering
  - **Edit Identities**: Full identity trait editing with real-time validation
  - **Delete Identities**: Safe deletion with confirmation dialogs
  - **Recovery Links**: Generate secure recovery links for password reset
- **🔐 Session Management**: Real-time session monitoring and control:
  - Active session tracking with detailed information
  - Session duration and activity analytics
  - Session termination capabilities
  - User device and location tracking
- **📋 Schema Management**: Identity schema inspection and management:
  - View all configured identity schemas
  - Schema structure visualization with syntax highlighting
  - Schema properties and validation rules display
  - Read-only schema browsing (creation via API not supported)
- **👤 User Profile**: User account management:
  - Profile information display
  - Role-based access control (Admin/Viewer)
  - Account settings and preferences

### 🚀 Technical Excellence

- **Clean Architecture**: Feature-based organization with proper separation of concerns
- **Smart Pagination**: Efficient data loading with date-based pagination stopping
- **Real-time Updates**: TanStack Query for optimal data synchronization
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Performance Optimized**: Smart caching and efficient API calls
- **Form Validation**: Advanced form validation with real-time feedback using React JSON Schema Form
- **Phone Number Support**: International phone number validation with libphonenumber-js

### 🎨 User Experience

- **Modern UI**: Clean, professional interface with Material-UI v7 design system
- **Interactive Charts**: MUI X Charts for analytics visualization with real-time data
- **Advanced Search**: Client-side and server-side search with instant filtering
- **Visual Feedback**: Color-coded validation states and loading indicators
- **Accessibility**: WCAG compliant components with keyboard navigation support

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI v7 + MUI X Charts/DataGrid
- **Forms**: React JSON Schema Form (RJSF) with custom Material-UI widgets
- **Validation**: libphonenumber-js for international phone numbers
- **State Management**: Zustand + TanStack Query
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Emotion
- **API Client**: Ory Kratos Client
- **Authentication**: Custom auth system with persistent storage

## 📋 Prerequisites

- Node.js 22+ and npm
- Running Ory Kratos instance
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/dhia-gharsallaoui/kratos-admin-ui.git
   cd kratos-admin-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   # Create environment file
   cp .env.example .env.local

   # Edit with your Kratos URLs
   KRATOS_PUBLIC_URL=http://localhost:4433
   KRATOS_ADMIN_URL=http://localhost:4434
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with default credentials:
     - **Admin**: `admin` / `admin123`
     - **Viewer**: `viewer` / `viewer123`

### Docker

The pre-built Docker image is available on Docker Hub:

```bash
docker pull dhiagharsallaoui/kratos-admin-ui:latest
```

**Quick Start with Docker:**

```bash
docker run -p 3000:3000 \
  -e KRATOS_PUBLIC_URL=http://localhost:4433 \
  -e KRATOS_ADMIN_URL=http://localhost:4434 \
  dhiagharsallaoui/kratos-admin-ui:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  kratos-admin-ui:
    image: dhiagharsallaoui/kratos-admin-ui:latest
    ports:
      - '3000:3000'
    environment:
      - KRATOS_PUBLIC_URL=http://kratos:4433
      - KRATOS_ADMIN_URL=http://kratos:4434
    depends_on:
      - kratos
    networks:
      - kratos-network

  kratos:
    image: oryd/kratos:v1.0.0
    # ... your Kratos configuration
```

**Development Setup:**
For a complete development environment with Kratos, check the [`dev/`](./dev) folder which includes:

- Docker Compose with Kratos, self-service UI, and MailSlurper
- Multiple identity schemas (organizational, customer)
- Automated test data generation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected application routes
│   │   ├── dashboard/     # Analytics dashboard
│   │   ├── identities/    # Identity management
│   │   ├── sessions/      # Session monitoring
│   │   ├── schemas/       # Schema management
│   │   └── profile/       # User profile
│   └── (auth)/            # Authentication pages
├── components/            # Shared UI components
│   ├── layout/           # Layout components (AdminLayout, Footer)
│   ├── navigation/       # Navigation components
│   └── ui/               # Reusable UI components
├── features/             # Feature-based modules
│   ├── analytics/        # Analytics functionality
│   ├── auth/            # Authentication system
│   ├── identities/      # Identity management
│   ├── sessions/        # Session management
│   └── schemas/         # Schema management
├── services/            # API services layer
│   └── kratos/          # Kratos API integration
├── providers/           # React context providers
└── styles/              # Global styles
```

## 🎛️ Configuration

### Environment Variables

| Variable            | Description           | Default                 |
| ------------------- | --------------------- | ----------------------- |
| `KRATOS_PUBLIC_URL` | Kratos public API URL | `http://localhost:4433` |
| `KRATOS_ADMIN_URL`  | Kratos admin API URL  | `http://localhost:4434` |
| `BASE_PATH`         | Application base path | `/`                     |
| `NODE_ENV`          | Environment mode      | `development`           |

### Authentication

The application uses a mock authentication system with predefined users:

- **Admin User**: Full access to all features
  - Username: `admin`
  - Password: `admin123`
- **Viewer User**: Read-only access
  - Username: `viewer`
  - Password: `viewer123`

### Kratos Integration

The application integrates with Kratos through:

- **Identity API**: CRUD operations on user identities
- **Session API**: Session management and monitoring
- **Schema API**: Identity schema management
- **Metadata API**: System metadata and health checks

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Quality

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking enabled
- **Husky**: Git hooks for code quality (if configured)

### Architecture Principles

1. **Feature-Based Organization**: Code organized by business features
2. **Clean API Abstraction**: Services layer abstracts Kratos API complexity
3. **Smart Pagination**: Efficient data loading with automatic stopping
4. **Type Safety**: Comprehensive TypeScript coverage
5. **Performance First**: Optimized queries and caching strategies

## 📊 Analytics Features

### Dashboard Metrics

- **Identity Analytics**: Growth trends, schema distribution, verification status
- **Session Analytics**: Active sessions, usage patterns, duration metrics
- **System Health**: Real-time status monitoring

## 🐳 Production Deployment

### Docker Best Practices

- Multi-stage build for minimal image size
- Non-root user for security
- Health checks included
- Standalone Next.js output

### Kubernetes Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kratos-admin-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kratos-admin-ui
  template:
    metadata:
      labels:
        app: kratos-admin-ui
    spec:
      containers:
        - name: kratos-admin-ui
          image: dhiagharsallaoui/kratos-admin-ui:latest
          ports:
            - containerPort: 3000
          env:
            - name: KRATOS_PUBLIC_URL
              value: 'http://kratos:4433'
            - name: KRATOS_ADMIN_URL
              value: 'http://kratos:4434'
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'
```

**Runtime Configuration:**
The Docker image supports runtime configuration through environment variables, making it easy to deploy across different environments without rebuilding.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for all new code
- Write tests for new features
- Update documentation as needed
- Run `npm run lint` and `npm run format` before committing

## 🔧 Troubleshooting

### Common Issues

1. **Kratos Connection Failed**
   - Verify `KRATOS_PUBLIC_URL` and `KRATOS_ADMIN_URL` are correct
   - Check network connectivity between services
   - Ensure Kratos is running and accessible

2. **Authentication Issues**
   - Clear browser localStorage and try again
   - Verify user credentials match the configured users
   - Check browser console for errors

3. **Build Failures**
   - Run `npm ci` to clean install dependencies
   - Check Node.js version (18+ required)
   - Verify TypeScript errors with `npm run lint`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ory Kratos](https://www.ory.sh/kratos/) for the excellent identity management system
- [dfoxg/kratos-admin-ui](https://github.com/dfoxg/kratos-admin-ui) for the original inspiration and foundational concepts
- [Next.js](https://nextjs.org/) team for the amazing React framework
- [Material-UI](https://mui.com/) for the beautiful component library
- [TanStack Query](https://tanstack.com/query) for state management
