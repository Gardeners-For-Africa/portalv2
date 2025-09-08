# Teacher Payment Management System

This directory contains the payment management components for teachers in the school management portal.

## Components

### 1. TeacherPaymentsDashboard
- **Purpose**: Main dashboard for teachers to view student payment status
- **Features**:
  - Overview of payment statistics (total students, paid, owing, amounts)
  - Filterable student list by class, term, and academic year
  - Quick actions to view details or generate invoices
  - Search functionality for students

### 2. StudentPaymentDetails
- **Purpose**: Detailed view of individual student payment information
- **Features**:
  - Student information and contact details
  - Payment summary with visual indicators
  - Payment history in tabbed format
  - Fee breakdown by category
  - Document management section

### 3. InvoiceGenerator
- **Purpose**: Create and customize invoices for students
- **Features**:
  - Select specific fees to include
  - Customize invoice details (dates, notes, terms)
  - Real-time calculation of totals
  - Preview of invoice before generation
  - Export, print, and send options

### 4. PaymentReports
- **Purpose**: Analytics and reporting for payment data
- **Features**:
  - Key metrics dashboard
  - Monthly payment trends
  - Class-by-class breakdown
  - Fee category analysis
  - Exportable reports

## Navigation

The payment system follows this navigation structure:
```
/dashboard/teacher/payments                    - Main payments dashboard
/dashboard/teacher/payments/student/:id        - Student payment details
/dashboard/teacher/payments/invoice/:id        - Generate invoice for student
/dashboard/teacher/payments/reports            - Payment reports and analytics
```

## Key Features

### For Teachers:
- View payment status of all students in their classes
- Generate invoices for individual students
- Access detailed payment history and analytics
- Export payment reports
- Monitor payment trends over time

### Payment Status Tracking:
- **Paid**: Students who have completed all fee payments
- **Owing**: Students with outstanding balances
- **Partial**: Students who have made some payments

### Invoice Management:
- Customizable fee selection
- Automatic calculations (subtotal, tax, total)
- Professional invoice formatting
- Multiple export options

## Data Sources

The components use mock data from:
- `mockStudents`: Student information
- `mockPayments`: Payment records
- `mockFees`: Fee structure and amounts
- `mockClasses`: Class information

## Future Enhancements

- Integration with real payment gateways
- Email automation for invoice delivery
- Advanced chart visualizations
- Bulk invoice generation
- Payment reminder system
- Real-time payment notifications

## Usage

1. **Access Payments**: Navigate to `/dashboard/teacher/payments`
2. **View Student Details**: Click "View Details" on any student row
3. **Generate Invoice**: Click "Generate Invoice" or navigate to invoice generator
4. **View Reports**: Click "View Reports" button for analytics
5. **Export Data**: Use export buttons to download reports and invoices

## Technical Notes

- Built with React and TypeScript
- Uses shadcn/ui components for consistent styling
- Responsive design for mobile and desktop
- Mock data integration for development
- Toast notifications for user feedback
- Navigation with React Router
