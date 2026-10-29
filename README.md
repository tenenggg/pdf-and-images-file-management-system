# 📁 File Management System

A full-stack file management platform built with React, Node.js, Express, and MySQL, designed specifically for managing **PDF documents and images (JPG, PNG)**. Features secure JWT authentication, role-based access control, hierarchical folder organization, and OCR-powered text extraction. Users can upload, organize, search, and manage their files through a modern, responsive interface with light/dark theme support.

---

## ✨ Features

- **🔐 Secure Authentication** — JWT-based login/register with HTTP-only cookies and role-based access control (Admin & User roles)
- **📂 Hierarchical Folder Management** — Create, rename, and organize folders in a nested directory structure with breadcrumb navigation
- **📄 File Upload & Management** — Upload, preview, download, rename, and soft-delete PDF documents and images (JPG, PNG) with drag-and-drop support
- **🔍 Full-Text Search** — Search across file names and extracted document content for instant retrieval
- **🧠 OCR Text Extraction** — Automatically extract text from uploaded PDFs and images using Tesseract.js for searchable content
- **👥 Admin User Management** — Admin dashboard to create, edit, and manage user accounts and roles
- **🌗 Light & Dark Theme** — Toggle between light and dark mode with persistent preference storage
- **📱 Responsive Design** — Fully responsive UI that works seamlessly across desktop, tablet, and mobile devices
- **📊 Grid & List Views** — Switch between grid and list view modes for browsing files and folders

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **React Router v7** | Client-side routing & navigation |
| **Vite 8** | Build tool & dev server |
| **CSS Modules** | Scoped, modular styling |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Server-side runtime |
| **Express.js** | REST API framework |
| **MySQL** | Relational database |
| **JWT** | Authentication & authorization |
| **Multer** | File upload handling |
| **Tesseract.js** | OCR text extraction |
| **bcryptjs** | Password hashing |

---

## 📦 Project Structure

```
file-management-system/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service modules
│   │   ├── styles/          # CSS module stylesheets
│   │   └── utils/           # Utility functions
│   └── index.html
├── backend/                 # Node.js + Express API
│   ├── config/              # Database & environment config
│   ├── controllers/         # Route controllers
│   ├── database/            # SQL schema
│   ├── middleware/          # Auth & error handling middleware
│   ├── models/              # Database models
│   ├── routes/              # API route definitions
│   ├── scripts/             # Database setup scripts
│   ├── services/            # Business logic services
│   └── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MySQL** v8.0 or higher
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/file-management-system.git
cd file-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=file_management_system

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5180
UPLOAD_DIR=uploads
```

Initialize the database:

```bash
npm run db:setup
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_API_BASE_URL=/api
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5180
```

Start the development server:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to `http://localhost:5180`

**Default Accounts:**
| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin` |
| Viewer | `viewer` | `viewer` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/users` | List all users (admin) |
| `PATCH` | `/api/users/:id` | Update user (admin) |
| `DELETE` | `/api/users/:id` | Delete user (admin) |
| `GET` | `/api/folders` | List folders |
| `POST` | `/api/folders` | Create folder |
| `PATCH` | `/api/folders/:id` | Update folder |
| `DELETE` | `/api/folders/:id` | Delete folder |
| `GET` | `/api/files` | List files |
| `POST` | `/api/uploads` | Upload file |
| `GET` | `/api/files/:id/download` | Download file |
| `PATCH` | `/api/files/:id` | Update file |
| `DELETE` | `/api/files/:id` | Delete file |
| `GET` | `/api/files/search` | Search files |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
