t# SOCIAL WALK - Employee Attendance Management

This is a full-stack Employee Attendance Management System built with Next.js, MongoDB Atlas, and Tailwind CSS.

## 🚀 Features

- **Role-based Access**: Separate dashboards and functionalities for Employees and Admins.
- **JWT Authentication**: Secure login with JWT stored in HTTP-only cookies.
- **Attendance Tracking**: Employees can check-in and check-out, with a live timer tracking work hours.
- **Attendance History**: View and filter attendance records, with an option to export as CSV.
- **Admin Dashboard**: At-a-glance view of key metrics like total employees and presence.
- **Employee Management**: Admins can perform CRUD operations on employee records.
- **Attendance Oversight**: Admins can view and manage attendance records for all employees.
- **Responsive Design**: Fully responsive and mobile-friendly interface.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Styling**: Tailwind CSS & shadcn/ui
- **Authentication**: JWT, bcryptjs
- **Form Management**: React Hook Form
- **Schema Validation**: Zod

---

## Setup Instructions

### 1. Prerequisites

- Node.js (v18.17 or later)
- npm or yarn
- A free MongoDB Atlas account

### 2. Getting Started

**Clone the repository:**

```bash
git clone <your-repo-url>
cd social-walk
```

**Install dependencies:**

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add your MongoDB Atlas connection string.

You can get this from your MongoDB Atlas dashboard:
1. Go to your Cluster > Connect > Drivers.
2. Select Node.js and copy the connection string.
3. Replace `<password>` with the password for your database user.

```
MONGODB_URI="your-atlas-connection-string"
JWT_SECRET="a-very-secret-and-strong-key-for-jwt"
```

> **Note**: The `JWT_SECRET` can be any long, random string. It's used to sign the authentication tokens.

### 4. Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Login Credentials

- **Admin Login**:
  - **Email**: `admin@company.com`
  - **Password**: `admin123`
  - The first time you log in as admin, the admin user will be created in the database.

- **Employee Login**:
  - Admins can create new employees from the Admin Dashboard (`/sk-admin/employees`). Use the credentials you create to log in as an employee.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase.
