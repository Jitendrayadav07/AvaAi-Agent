

  <p style="font-size:18px; font-weight:bold">Bounty9000</p>

  Frontend: A React application for building a responsive and interactive user interface.
  Backend: A Node.js application with a MySQL database for handling server-side logic and API requests.
  AI-Agent: A Python-based module for AI functionalities and integrations.

  Folder Structure

  ├── frontend/   # React application for the user interface  
  ├── backend/    # Node.js application with MySQL database  
  └── ai-agent/   # Python-based AI agent for advanced functionalities  

  Setup

  Prerequisites

  Ensure you have the following installed:

  Node.js (version >= 18)
  MySQL (latest version)
  Python (version >= 3.8)
  npm for package management

  Installation

  1. Clone the repository:
    git clone https://github.com/your-repo/project-name.git  
    cd project-name

  2. Setup the frontend:
    cd frontend  
    npm install  
    npm start

    Runs on port 3000

  3. Setup the backend:
    cd backend  
    npm install  
    npm start

    Runs on port 3003


  4. Setup the AI-Agent:
    cd ai-agent
    python3 -m venv .venv
    pip3 install -r requirements.txt

    source .venv/bin/activate
    flask run - to start the application.

    Runs on port 5000

  Note - Make sure to keep all the projects running parallely

  Usage
  Start the frontend, backend, and AI-agent.
  Open your browser and navigate to http://localhost:3000 to view the application.


  Our Basic Architecture

  ![Architect of our app](./basic-arc.jpg)




