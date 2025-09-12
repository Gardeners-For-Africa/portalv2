# Gardeners for Africa Portal - Web Frontend

## Project Overview

This is the web frontend for the Gardeners for Africa Portal, a comprehensive school management system built with React, TypeScript, and Vite. The portal provides role-based access for different user types including super admins, school admins, teachers, students, and parents.

## Project info

**URL**: https://lovable.dev/projects/4172a01d-08ab-48d5-a32b-7bf207e31a36

## Features

### Teacher Invitation System

The portal includes a comprehensive teacher invitation system that allows school administrators to:

- **Invite Teachers**: Send email invitations to potential teachers with personalized messages
- **Track Invitations**: Monitor invitation status (pending, accepted, declined, expired, cancelled)
- **Manage Invitations**: Edit, resend, or cancel pending invitations
- **View Statistics**: Get insights into invitation metrics and success rates
- **Public Acceptance**: Teachers can accept or decline invitations through a public interface

#### Key Components

- **TeacherInvitations**: Main management interface for school admins
- **TeacherInvitationAccept**: Public page for teachers to accept/decline invitations
- **Teacher Invitation Service**: API service for handling invitation operations
- **Type Definitions**: Comprehensive TypeScript types for type safety

#### Invitation Workflow

1. **School Admin** creates invitation with teacher's email and optional personal message
2. **System** generates unique invitation token and sends email
3. **Teacher** receives email with invitation link
4. **Teacher** clicks link to view invitation details
5. **Teacher** can accept (create account) or decline the invitation
6. **System** updates invitation status and creates teacher account if accepted

#### API Integration

The frontend integrates with the backend API endpoints:
- `POST /teacher-invitations` - Create invitation
- `GET /teacher-invitations` - List invitations with filters
- `GET /teacher-invitations/stats` - Get invitation statistics
- `PUT /teacher-invitations/:id` - Update invitation
- `POST /teacher-invitations/:id/resend` - Resend invitation
- `DELETE /teacher-invitations/:id` - Cancel invitation
- `GET /invite/teacher?token=:token` - Get invitation by token (public)
- `POST /invite/teacher/accept` - Accept invitation (public)
- `POST /invite/teacher/decline` - Decline invitation (public)

### School Onboarding System

The portal includes a comprehensive school onboarding system for super administrators to:

- **Monitor Onboarding**: Track all school onboarding processes in real-time
- **Manage Approvals**: Approve or reject onboarding requests with detailed notes
- **View Analytics**: Get insights into onboarding performance and completion rates
- **Export Data**: Download onboarding data for analysis and reporting
- **Step Tracking**: Monitor progress through each onboarding step
- **Performance Insights**: Identify bottlenecks and improvement opportunities

#### Key Components

- **OnboardingManagement**: Main interface for monitoring and managing onboardings
- **OnboardingAnalytics**: Comprehensive analytics and performance insights
- **OnboardingPage**: Combined management and analytics interface
- **School Onboarding Service**: API service for all onboarding operations
- **Type Definitions**: Complete TypeScript types for onboarding data

#### Onboarding Workflow

1. **School Registration** - Schools start the onboarding process
2. **Step Completion** - Schools complete each required step
3. **Document Upload** - Schools upload required documents
4. **Verification** - Super admin reviews and verifies documents
5. **Approval Process** - Super admin approves or rejects onboarding
6. **Completion** - School gains full access to the platform

#### Analytics Features

- **Completion Rates** - Track overall and step-by-step completion rates
- **Time Analysis** - Monitor average completion times
- **Trend Analysis** - View monthly and quarterly trends
- **Abandonment Analysis** - Identify common abandonment reasons
- **Performance Insights** - Automated recommendations for improvement

### Other Features

- **Role-Based Dashboard**: Different interfaces for different user types
- **Student Management**: Complete student lifecycle management
- **Class Management**: Organize students into classes and sections
- **Subject Management**: Define and assign subjects to classes
- **Grading System**: Comprehensive grading and reporting system
- **Payment Management**: Fee collection and payment tracking
- **Notification System**: Real-time notifications for important events

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4172a01d-08ab-48d5-a32b-7bf207e31a36) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4172a01d-08ab-48d5-a32b-7bf207e31a36) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
