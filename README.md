# BookIt - Live Event Booking Platform

This project is a Live Event Booking Platform built with a React/Next.js frontend and a Node/Express/TypeScript backend, backed by PostgreSQL.

---

## 🛠️ Step-by-Step Local Setup

Follow these steps to set up and run the application locally:

### Step 1: Clone the Repository
Clone the codebase and navigate to the project directory:
```bash
git clone <repository-url>
cd assignment
```

### Step 2: Configure the Backend Database
1. Go to the `backend` directory and set up your environment variables. Copy the example template into a new `.env` file:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Open the `.env` file and enter your PostgreSQL credentials and a `JWT_SECRET`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookit
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=super_secret_key_123
   FRONTEND_URL=http://localhost:3000
   ```
3. Open your PostgreSQL terminal/GUI and create a new database with the name specified in `DB_NAME` (e.g., `bookit`).

### Step 3: Install Dependencies, Migrate and Seed the Database
1. Install backend packages:
   ```bash
   npm install
   ```
2. Run database migrations to create the required tables:
   ```bash
   npm run migrate
   ```
3. Seed the database with initial testing data:
   ```bash
   npm run seed
   ```

### Step 4: Run the Backend
Start the backend development server:
```bash
npm run dev
```
The backend API will run on `http://localhost:5000`.

### Step 5: Configure and Run the Frontend
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend packages:
   ```bash
   npm install
   ```
3. Set up the local API URL in `frontend/.env.local` if not already present:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
The frontend application will run on `http://localhost:3000`.

---

## 🛠️ Workspace Root Orchestration Scripts
You can also run these orchestration scripts directly from the workspace root:
* `npm run dev` - Starts both frontend and backend dev servers concurrently.
* `npm run build` - Compiles both backend and frontend applications.
* `npm run migrate` - Executes database migrations.
* `npm run seed` - Runs database seeds.
