import { DataSource } from "typeorm";
import { Permission } from "../entities/permission.entity";

export class PermissionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const permissionRepository = this.dataSource.getRepository(Permission);

    const permissions = [
      // System permissions
      {
        name: "system:read",
        displayName: "View System Information",
        description: "View system information and status",
        category: "system",
        isActive: true,
      },
      {
        name: "system:write",
        displayName: "Modify System Settings",
        description: "Modify system-wide settings and configuration",
        category: "system",
        isActive: true,
      },

      // User management permissions
      {
        name: "user:read",
        displayName: "View Users",
        description: "View user information and profiles",
        category: "user_management",
        isActive: true,
      },
      {
        name: "user:write",
        displayName: "Manage Users",
        description: "Create, update, and manage user accounts",
        category: "user_management",
        isActive: true,
      },
      {
        name: "user:delete",
        displayName: "Delete Users",
        description: "Delete user accounts",
        category: "user_management",
        isActive: true,
      },

      // Profile permissions
      {
        name: "profile:read",
        displayName: "View Profile",
        description: "View own profile information",
        category: "profile",
        isActive: true,
      },
      {
        name: "profile:write",
        displayName: "Update Profile",
        description: "Update own profile information",
        category: "profile",
        isActive: true,
      },

      // School management permissions
      {
        name: "school:read",
        displayName: "View Schools",
        description: "View school information and details",
        category: "school_management",
        isActive: true,
      },
      {
        name: "school:write",
        displayName: "Manage Schools",
        description: "Create, update, and manage school information",
        category: "school_management",
        isActive: true,
      },
      {
        name: "school:delete",
        displayName: "Delete Schools",
        description: "Delete school records",
        category: "school_management",
        isActive: true,
      },

      // School registration permissions
      {
        name: "school_registration:read",
        displayName: "View School Registrations",
        description: "View school registration applications",
        category: "school_registration",
        isActive: true,
      },
      {
        name: "school_registration:write",
        displayName: "Manage School Registrations",
        description: "Create and update school registration applications",
        category: "school_registration",
        isActive: true,
      },
      {
        name: "school_registration:review",
        displayName: "Review School Registrations",
        description: "Review and approve/reject school registration applications",
        category: "school_registration",
        isActive: true,
      },

      // Student management permissions
      {
        name: "student:read",
        displayName: "View Students",
        description: "View student information and profiles",
        category: "student_management",
        isActive: true,
      },
      {
        name: "student:write",
        displayName: "Manage Students",
        description: "Create, update, and manage student records",
        category: "student_management",
        isActive: true,
      },
      {
        name: "student:delete",
        displayName: "Delete Students",
        description: "Delete student records",
        category: "student_management",
        isActive: true,
      },

      // Child management permissions (for parents)
      {
        name: "child:read",
        displayName: "View Child Information",
        description: "View information about their children",
        category: "parent_management",
        isActive: true,
      },

      // Teacher management permissions
      {
        name: "teacher:read",
        displayName: "View Teachers",
        description: "View teacher information and profiles",
        category: "teacher_management",
        isActive: true,
      },
      {
        name: "teacher:write",
        displayName: "Manage Teachers",
        description: "Create, update, and manage teacher records",
        category: "teacher_management",
        isActive: true,
      },
      {
        name: "teacher:delete",
        displayName: "Delete Teachers",
        description: "Delete teacher records",
        category: "teacher_management",
        isActive: true,
      },

      // Class management permissions
      {
        name: "class:read",
        displayName: "View Classes",
        description: "View class information and schedules",
        category: "class_management",
        isActive: true,
      },
      {
        name: "class:write",
        displayName: "Manage Classes",
        description: "Create, update, and manage class information",
        category: "class_management",
        isActive: true,
      },
      {
        name: "class:delete",
        displayName: "Delete Classes",
        description: "Delete class records",
        category: "class_management",
        isActive: true,
      },

      // Subject management permissions
      {
        name: "subject:read",
        displayName: "View Subjects",
        description: "View subject information and curriculum",
        category: "subject_management",
        isActive: true,
      },
      {
        name: "subject:write",
        displayName: "Manage Subjects",
        description: "Create, update, and manage subject information",
        category: "subject_management",
        isActive: true,
      },
      {
        name: "subject:delete",
        displayName: "Delete Subjects",
        description: "Delete subject records",
        category: "subject_management",
        isActive: true,
      },

      // Grade management permissions
      {
        name: "grade:read",
        displayName: "View Grades",
        description: "View student grades and academic performance",
        category: "grade_management",
        isActive: true,
      },
      {
        name: "grade:write",
        displayName: "Manage Grades",
        description: "Create, update, and manage student grades",
        category: "grade_management",
        isActive: true,
      },

      // Attendance management permissions
      {
        name: "attendance:read",
        displayName: "View Attendance",
        description: "View student attendance records",
        category: "attendance_management",
        isActive: true,
      },
      {
        name: "attendance:write",
        displayName: "Manage Attendance",
        description: "Create, update, and manage attendance records",
        category: "attendance_management",
        isActive: true,
      },

      // Assignment management permissions
      {
        name: "assignment:read",
        displayName: "View Assignments",
        description: "View assignments and homework",
        category: "assignment_management",
        isActive: true,
      },
      {
        name: "assignment:write",
        displayName: "Manage Assignments",
        description: "Create, update, and manage assignments",
        category: "assignment_management",
        isActive: true,
      },
      {
        name: "assignment:delete",
        displayName: "Delete Assignments",
        description: "Delete assignment records",
        category: "assignment_management",
        isActive: true,
      },

      // Exam management permissions
      {
        name: "exam:read",
        displayName: "View Exams",
        description: "View exam information and schedules",
        category: "exam_management",
        isActive: true,
      },
      {
        name: "exam:write",
        displayName: "Manage Exams",
        description: "Create, update, and manage exams",
        category: "exam_management",
        isActive: true,
      },

      // Timetable permissions
      {
        name: "timetable:read",
        displayName: "View Timetable",
        description: "View class and school timetables",
        category: "timetable",
        isActive: true,
      },

      // Enrollment management permissions
      {
        name: "enrollment:read",
        displayName: "View Enrollments",
        description: "View student enrollment information",
        category: "enrollment_management",
        isActive: true,
      },
      {
        name: "enrollment:write",
        displayName: "Manage Enrollments",
        description: "Create, update, and manage student enrollments",
        category: "enrollment_management",
        isActive: true,
      },

      // Payment management permissions
      {
        name: "payment:read",
        displayName: "View Payments",
        description: "View payment information and transactions",
        category: "payment_management",
        isActive: true,
      },
      {
        name: "payment:write",
        displayName: "Manage Payments",
        description: "Process and manage payments",
        category: "payment_management",
        isActive: true,
      },

      // Invoice management permissions
      {
        name: "invoice:read",
        displayName: "View Invoices",
        description: "View invoice information",
        category: "invoice_management",
        isActive: true,
      },
      {
        name: "invoice:write",
        displayName: "Manage Invoices",
        description: "Create, update, and manage invoices",
        category: "invoice_management",
        isActive: true,
      },

      // Fee management permissions
      {
        name: "fee:read",
        displayName: "View Fees",
        description: "View fee structure and information",
        category: "fee_management",
        isActive: true,
      },
      {
        name: "fee:write",
        displayName: "Manage Fees",
        description: "Create, update, and manage fee structures",
        category: "fee_management",
        isActive: true,
      },

      // Report permissions
      {
        name: "report:read",
        displayName: "View Reports",
        description: "View various reports and analytics",
        category: "reporting",
        isActive: true,
      },
      {
        name: "report:write",
        displayName: "Generate Reports",
        description: "Generate and create reports",
        category: "reporting",
        isActive: true,
      },

      // Notification permissions
      {
        name: "notification:read",
        displayName: "View Notifications",
        description: "View notifications and messages",
        category: "notifications",
        isActive: true,
      },

      // Onboarding permissions
      {
        name: "onboarding:read",
        displayName: "View Onboarding",
        description: "View onboarding progress and status",
        category: "onboarding",
        isActive: true,
      },
      {
        name: "onboarding:write",
        displayName: "Manage Onboarding",
        description: "Manage user onboarding process",
        category: "onboarding",
        isActive: true,
      },
      {
        name: "onboarding:approve",
        displayName: "Approve Onboarding",
        description: "Approve user onboarding applications",
        category: "onboarding",
        isActive: true,
      },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        console.log(`Created permission: ${permissionData.name}`);
      } else {
        console.log(`Permission already exists: ${permissionData.name}`);
      }
    }
  }
}
