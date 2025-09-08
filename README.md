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

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-portal
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Ensure code passes all linting checks
- Update documentation for new features

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
