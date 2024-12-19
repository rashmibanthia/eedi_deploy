Here's a step-by-step guide of how we built the frontend from scratch:

1. **Project Creation**:
```bash
npm create vite@latest eedi_frontend -- --template react
cd eedi_frontend
```

2. **Essential Dependencies** (`package.json`):
   - Core Dependencies:
     ```bash
     npm install react react-dom axios @headlessui/react
     ```
   - Dev Dependencies:
     ```bash
     npm install -D @vitejs/plugin-react vite
     npm install -D typescript @types/node @types/react @types/react-dom
     npm install -D tailwindcss postcss autoprefixer
     ```

3. **Configuration Files**:
   - `vite.config.js`: Configure Vite with React plugin and API proxy
   - `postcss.config.js`: Set up PostCSS for Tailwind
   - `tailwind.config.js`: Configure Tailwind CSS
   - `env.d.ts`: TypeScript declarations for environment variables
   - `.gitignore`: Standard Node/React gitignore patterns

4. **Project Structure**:
```
eedi_frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Header.jsx
│   │   ├── QuestionForm.jsx
│   │   └── MisconceptionResults.jsx
│   ├── services/            # API services
│   │   └── misconceptionService.ts
│   ├── utils/              # Utility functions
│   │   └── dataProcessor.js
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
└── index.html             # HTML template
```

5. **Key Components**:
   - `Header.jsx`: Navigation and title
   - `QuestionForm.jsx`: Main form with subject/topic dropdowns
   - `MisconceptionResults.jsx`: Display analysis results

6. **API Integration**:
   - `misconceptionService.ts`: Handle API calls
   - `dataProcessor.js`: Process data from API

7. **Styling Setup**:
   - Install Tailwind CSS:
     ```bash
     npx tailwindcss init -p
     ```
   - Configure in `index.css`:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

8. **Development Commands**:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

9. **Environment Setup**:
   - `.env`: Environment variables
   - Development: `http://localhost:5173`
   - Production: Modal deployment URL

This structure provides:
- Clean component separation
- Type safety with TypeScript
- Modern styling with Tailwind
- Efficient development with Vite
- Clear API integration pattern
- Easy deployment configuration

The project follows React best practices and modern frontend development patterns.

------------------

Here's a high-level overview of the frontend changes we made:

1. **API Integration Files**:
   - `misconceptionService.ts`: Set up API URL handling for both development and production environments using Modal URL
   - `dataProcessor.js`: Converted from CSV file reading to API endpoint consumption for subjects and constructs

2. **Configuration Files**:
   - `vite.config.js`: Added proxy configuration for development and Modal URL definition
   - `index.html`: Added base href and updated metadata
   - `env.d.ts`: Added TypeScript declarations for Vite's environment variables

3. **Component Files**:
   - `QuestionForm.jsx`: 
     - Removed direct CSV file handling
     - Added loading and error states
     - Improved error handling for API calls
     - Enhanced dropdown functionality

4. **Package Management**:
   - `package.json`: Updated dependencies
     - Added Axios for API calls
     - Added TypeScript support
     - Added necessary React and Vite packages

5. **Key Changes**:
   - Moved from local CSV file to API-based data fetching
   - Implemented proper error handling and loading states
   - Added environment-aware API URL configuration
   - Improved type safety with TypeScript
   - Enhanced user feedback during data loading

The main architectural change was moving from static file-based data (CSV) to a dynamic API-based approach, making the application more maintainable and scalable.

----

Should this be VITE_API_URL=http://localhost:5173 or VITE_API_URL=http://localhost:8000 in .env file?


It should be `VITE_API_URL_DEV=http://localhost:8000` because:

1. Port 8000 is where your FastAPI backend is running:
```bash
# Backend runs on 8000
python -m uvicorn app:app --reload --port 8000
```

2. Port 5173 is Vite's default development server port for the frontend:
```bash
# Frontend runs on 5173
npm run dev
```

So in your `.env`:
```env
VITE_API_URL_DEV=http://localhost:8000
VITE_API_URL_PROD=https://rashmibanthia--eedi-misconception-analyzer.modal.run
```

The flow is:
1. Frontend runs on port 5173
2. Frontend makes API calls to backend on port 8000
3. In development, Vite's proxy forwards `/api` requests to `http://localhost:8000`
4. In production, requests go to the Modal URL

Your `vite.config.js` handles the proxy in development:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

This way:
- Development API calls: `http://localhost:8000/api/*`
- Production API calls: `https://rashmibanthia--eedi-misconception-analyzer.modal.run/api/*`
---

export PYTHONPATH=$PYTHONPATH:/Users/rashmi/Documents/kaggle/eedi/eedi_deploy/src
export PYTHONPATH=$PYTHONPATH:/home/rashmi/Documents/kaggle/eedi_deploy/src
uvicorn src.eedi_api_service.create_app:create_app --reload