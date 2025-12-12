# **App Name**: AttendEasy

## Core Features:

- Employee Login: Secure login using email and password with JWT authentication and HTTP-only cookies for session management. Password hashing with bcrypt.
- Employee Dashboard: Display employee information including welcome message, current date & time (live clock), attendance status, check-in/out times, and a real-time working timer.
- Check-In/Out: Allow employees to check-in and check-out, storing timestamps, dates, and calculating total hours worked. Prevents double check-in/out.
- Attendance History: Display attendance history with date range filters, pagination, and CSV export functionality.
- Admin Dashboard: Display key metrics such as total employees, employees present today, total hours worked, and department statistics (optional chart).
- Employee Management: Enable admin to add, edit, and delete employees, including assigning roles (employee/admin) and departments. Prevent duplicate emails and deleting the last admin.
- Admin Attendance Management: Allow admins to filter attendance records by date range, employee, department, and status (active/completed), with CSV export.

## Style Guidelines:

- Primary color: Soft blue (#90AFC5) for a professional and calming feel, reflecting stability and trust suitable for an HR application.
- Background color: Light gray (#F0F4F8) to provide a clean and neutral backdrop, ensuring readability and reducing eye strain.
- Accent color: Teal (#4E8975) for interactive elements and key actions, offering a subtle contrast that draws attention without overwhelming.
- Font pairing: 'Inter' (sans-serif) for body text and 'Space Grotesk' (sans-serif) for headlines, ensuring a balance of readability and modern aesthetic.
- Use a set of consistent and clean icons from a library like FontAwesome or Material Icons, using the accent color for active states and important actions.
- Employ a card-based layout for dashboards with clear sections and padding, ensuring responsiveness across different screen sizes.
- Incorporate subtle animations for loading states and transitions, enhancing user experience without being distracting.