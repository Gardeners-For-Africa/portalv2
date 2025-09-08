# G4A School Management Portal v2

A comprehensive school management system built with modern web technologies, designed to streamline educational administration and enhance the learning experience for all stakeholders.

## 🏫 Overview

The G4A School Management Portal is a full-stack application that provides a centralized platform for managing all aspects of school operations. The system serves multiple user roles including Super Administrators, School Administrators, Teachers, Students, and Parents, each with tailored interfaces and functionalities.

## 🚀 Features

### Core Modules

#### 🏢 School Management
- **Multi-school Support**: Manage multiple schools from a single platform
- **School Registration**: Complete school profile setup and configuration
- **School Settings**: Customize academic calendars, terms, and policies

#### 👥 User Management
- **Role-based Access Control**: Secure access based on user roles
- **Student Management**: Complete student lifecycle from enrollment to graduation
- **Teacher Management**: Staff profiles, assignments, and performance tracking
- **Parent Portal**: Parent access to student information and communication

#### 📚 Academic Management
- **Subject Management**: Create and manage subjects and curricula
- **Class Management**: Organize students into classes and sections
- **Assignment Management**: Create and track assignments and projects
- **Grading System**: Comprehensive grading and assessment tools

#### 📊 Grading & Assessment
- **Flexible Grading**: Configurable grade boundaries and point systems
- **Exam Management**: Create and schedule examinations
- **Score Entry**: Individual and bulk score entry capabilities
- **Results Generation**: Automated termly and annual result processing
- **Performance Analytics**: Detailed academic performance insights

#### 💰 Financial Management
- **Fee Management**: Configure and manage school fees
- **Payment Tracking**: Monitor payment status and history
- **Invoice Generation**: Automated invoice creation and management
- **Financial Reports**: Comprehensive financial analytics and reporting

#### 📢 Communication
- **Notification System**: Real-time notifications and alerts
- **Announcements**: School-wide and targeted communications
- **Parent Communication**: Direct communication channels with parents

#### ⚙️ System Administration
- **Settings Management**: System-wide configuration options
- **User Preferences**: Personalized user experience settings
- **Data Management**: Import/export capabilities and data backup

## 🛠️ Technology Stack

### Frontend (Web)
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend (API)
- **NestJS** - Scalable Node.js framework
- **TypeScript** - Type-safe backend development
- **Express** - Web application framework
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Development Tools
- **Yarn Workspaces** - Monorepo management
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
new-portal/
├── api/                    # NestJS Backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── shared/         # Shared utilities
│   │   └── config/         # Configuration files
│   ├── test/               # E2E tests
│   └── package.json
├── web/                    # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** (v1.22 or higher)
- **Git**

### Quick Setup

**Option 1: Automated Setup (Recommended)**
```bash
git clone <repository-url>
cd new-portal
chmod +x setup.sh
./setup.sh
```

**Option 2: Manual Setup**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-portal
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up pre-commit hooks**
   ```bash
   yarn prepare
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment files
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   
   # Edit the environment files with your configuration
   ```

### Development

#### Start both frontend and backend in development mode:

```bash
# Start API server (runs on http://localhost:3000)
yarn api:dev

# Start Web application (runs on http://localhost:5173)
yarn web:dev
```

#### Individual services:

```bash
# API only
yarn api:dev

# Web only
yarn web:dev
```

### Building for Production

```bash
# Build both applications
yarn api:build
yarn web:build

# Start production servers
yarn api:start
yarn web:start
```

## 🧪 Testing

```bash
# Run all tests
yarn api:test
yarn web:test

# Run tests with coverage
yarn api:test:cov
yarn web:test:cov

# Run E2E tests
yarn api:test:e2e
yarn web:test:e2e
```

## 📝 Available Scripts

### Root Level Scripts
- `yarn api:dev` - Start API in development mode
- `yarn api:build` - Build API for production
- `yarn api:start` - Start API in production mode
- `yarn api:lint` - Lint API code
- `yarn api:test` - Run API tests
- `yarn web:dev` - Start web app in development mode
- `yarn web:build` - Build web app for production
- `yarn web:start` - Start web app in production mode
- `yarn web:lint` - Lint web code
- `yarn web:test` - Run web tests

## 🔐 User Roles & Permissions

### Super Administrator
- Manage multiple schools
- User management across all schools
- System-wide settings and configuration
- Global notifications and announcements

### School Administrator
- Manage school-specific users (students, teachers)
- Configure academic settings and grading
- Manage subjects, classes, and assignments
- Financial management and reporting
- School-wide notifications

### Teacher
- View assigned classes and students
- Grade management and score entry
- Assignment creation and management
- Student performance tracking
- Parent communication

### Student
- View personal academic records
- Access assignments and grades
- View payment status
- Receive notifications

### Parent
- View child's academic progress
- Monitor payment status
- Communication with teachers
- Access school announcements

## 🌐 API Documentation

The API follows RESTful principles and provides comprehensive endpoints for all system functionality. Detailed API documentation is available at `/api/docs` when running the development server.

### Key API Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Schools**: `/schools/*`
- **Students**: `/students/*`
- **Teachers**: `/teachers/*`
- **Subjects**: `/subjects/*`
- **Classes**: `/classes/*`
- **Grading**: `/grading/*`
- **Payments**: `/payments/*`
- **Notifications**: `/notifications/*`

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```bash
   # API Environment
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   
   # Web Environment
   VITE_API_URL=http://your-api-domain.com
   ```

2. **Build Applications**
   ```bash
   yarn api:build
   yarn web:build
   ```

3. **Deploy to your preferred platform**
   - **API**: Deploy to platforms like Heroku, AWS, DigitalOcean
   - **Web**: Deploy to Vercel, Netlify, or static hosting

## 🤝 Contributing

We welcome contributions to the G4A School Management Portal! Please follow these guidelines to ensure a smooth contribution process.

### Getting Started

1. **Fork the repository**
   ```bash
   git clone <your-fork-url>
   cd new-portal
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up pre-commit hooks**
   ```bash
   yarn prepare
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) to maintain a clean and consistent commit history. This enables automated version bumping and changelog generation.

#### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to our CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit

#### Examples

```bash
# Feature commits
git commit -m "feat(auth): add OAuth2 integration"
git commit -m "feat(grading): implement bulk grade import"

# Bug fixes
git commit -m "fix(payments): resolve invoice generation error"
git commit -m "fix(ui): correct sidebar navigation on mobile"

# Documentation
git commit -m "docs: update API documentation"
git commit -m "docs(readme): add deployment instructions"

# Refactoring
git commit -m "refactor(api): optimize database queries"
git commit -m "refactor(components): extract reusable form components"

# Performance improvements
git commit -m "perf(api): optimize student search endpoint"
git commit -m "perf(web): implement virtual scrolling for large lists"

# Testing
git commit -m "test(auth): add unit tests for login service"
git commit -m "test(api): add integration tests for payment endpoints"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore(ci): update GitHub Actions workflow"

# Breaking changes
git commit -m "feat(api)!: change user authentication flow

BREAKING CHANGE: The authentication endpoint now requires additional parameters"
```

### Pre-commit Hooks

We use [Husky](https://typicode.github.io/husky/) to enforce code quality and automate version management.

#### What happens on commit:

1. **Code Linting**: ESLint runs on staged files
2. **Code Formatting**: Prettier formats staged files
3. **Type Checking**: TypeScript compilation check
4. **Tests**: Run relevant tests for changed files
5. **Version Bumping**: Automatic version bumping based on commit types

#### Version Bumping Rules:

- **feat** commits → Minor version bump (1.0.0 → 1.1.0)
- **fix** commits → Patch version bump (1.0.0 → 1.0.1)
- **BREAKING CHANGE** → Major version bump (1.0.0 → 2.0.0)
- **chore**, **docs**, **style**, **refactor**, **perf**, **test** → No version bump

### Development Guidelines

#### Code Standards

- **TypeScript**: Use strict TypeScript configuration
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for consistent code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for public APIs

#### Testing Requirements

- **Unit Tests**: Write tests for all new functions and components
- **Integration Tests**: Test API endpoints and data flows
- **E2E Tests**: Add end-to-end tests for critical user journeys
- **Coverage**: Maintain at least 80% test coverage

#### Pull Request Process

1. **Create a descriptive PR title** using conventional commit format
2. **Provide detailed description** of changes and motivation
3. **Link related issues** using keywords like "Fixes #123"
4. **Add screenshots** for UI changes
5. **Update documentation** if needed
6. **Ensure all checks pass** (linting, tests, type checking)

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Commit Workflow

1. **Make your changes**
2. **Stage your changes**: `git add .`
3. **Commit with conventional format**: `git commit -m "feat: add new feature"`
4. **Push to your branch**: `git push origin feature/your-feature`
5. **Create Pull Request**

### Automated Workflows

#### Pre-commit Hooks (Husky)
- **Code Linting**: ESLint runs on staged files
- **Code Formatting**: Prettier formats staged files
- **Type Checking**: TypeScript compilation check
- **Tests**: Run relevant tests for changed files
- **Commit Message Validation**: Enforces conventional commit format

#### Version Management
- **Automatic Version Bumping**: Based on commit types
  - `feat` commits → Minor version bump (1.0.0 → 1.1.0)
  - `fix` commits → Patch version bump (1.0.0 → 1.0.1)
  - `BREAKING CHANGE` → Major version bump (1.0.0 → 2.0.0)
- **Changelog Generation**: Automatic changelog updates
- **Release Notes**: Automatic release note generation
- **Multi-package Versioning**: Syncs versions across API and Web packages

#### CI/CD Pipeline
- **Automated Testing**: Runs on every push and PR
- **Build Verification**: Ensures both API and Web build successfully
- **Release Automation**: Creates GitHub releases with build artifacts
- **Dependency Updates**: Automated security and dependency updates

### Getting Help

- **Documentation**: Check existing docs and README
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Request reviews from maintainers

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Favour Max-Oti** - *Initial work* - [maxotif@gmail.com](mailto:maxotif@gmail.com)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support and questions, please contact:
- Email: maxotif@gmail.com
- Create an issue in the repository

---

**G4A School Management Portal v2** - Empowering education through technology.
