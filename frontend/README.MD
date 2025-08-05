# Smartpix

A full-stack application with Python backend and React frontend.

## Project Structure

```
Smartpix/
├── backend/           # Python FastAPI backend
│   ├── .venv/        # Python virtual environment
│   ├── auth/         # Authentication modules
│   ├── models/       # Data models
│   ├── utils/        # Utility functions
│   └── app.py        # Main backend application
├── frontend/         # React frontend
│   └── project/      # React application
│       ├── node_modules/  # JavaScript dependencies
│       ├── src/      # React source code
│       └── package.json   # Node.js dependencies
└── README.md
```

## Setup and Installation

### Backend (Python FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the Python virtual environment:
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your environment variables:
```
SECRET_KEY=your_secret_key_here
```

5. Run the backend server:
```bash
python app.py
# or
uvicorn app:app --reload
```

### Frontend (React)

1. Navigate to the frontend project directory:
```bash
cd frontend/project
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The React app will typically run on `http://localhost:3000`

## Running the Application

1. **Start the backend** (in one terminal):
```bash
cd backend
.venv\Scripts\activate  # Windows
python app.py
```

2. **Start the frontend** (in another terminal):
```bash
cd frontend/project
npm start
```

## Technologies Used

### Backend
- Python
- FastAPI
- JWT Authentication
- MongoDB/Database integration

### Frontend
- React
- React Router
- Context API (Theme & Auth)
- Modern JavaScript (ES6+)

## Development Notes

- The backend uses Python virtual environment (`.venv/`)
- The frontend uses Node.js package management (`node_modules/`)
- Both `node_modules/` and `.venv/` are ignored in Git
- Environment variables should be stored in `.env` files (not committed to Git)

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## API Endpoints

The backend provides RESTful API endpoints for:
- User authentication
- Image processing
- Data management

(Add specific endpoint documentation as needed)