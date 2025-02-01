# CIS 4000: Veterans Society

TypeScript + Vite (frontend) : https://veterans-society.vercel.app/


FastAPI (backend): https://veterans-society-backend.vercel.app/


# How It Works

The two main directories are frontend and backend.

The frontend uses Vite.JS + React + TS (TypeScript with Vite.JS). For the UI, we use Chakra UI v2.

The backend uses FastAPI (Python), which contains the CRUD (Create Read Update Delete) REST API routes to an Amazon DynamoDB database.


## Getting Started

First, create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```
# Running the application frontend

Go into the frontend directory
```bash
cd frontend
```

Then, install the dependencies:

```bash
npm install
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

To kill the running frontend process, throw a SIGINT by pressing ^C.

## AWS Setup
In .env/pyenv.cfg, add these fields as aws credentials:
```
aws_access_key_id = example
aws_secret_access_key = example
aws_region = us-east-1
```

You may need to run: 
```
npm install aws-sdk
```

# Running the application backend
Before running, make sure you installed dependencies. Please do this after every pull. In veterans-society folder, run:
```
 pip install -r requirements.txt
```
In api/ run:
```
python3 -m venv venv
source venv/bin/activate
```

If already running the frontend, open another terminal window,
```
cd backend
uvicorn api.main:app --reload   
```
Otherwise python will not be able to create and read the correct packages.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

If you ever want to see registered endpoints, navigate to http://127.0.0.1:8000/docs.

To kill the running backend process, throw a SIGINT by pressing ^C.


# Sessions - specify key
In order to allow for sessions, in the .env, pyenv.cfg, insert:
```
secret_login_key = _
```
Instead of _, add some kind of characters, no quotes around it.

# Other .env variables
Ask the developers for private .env variables.

# [Important] Pull Requests
- Never push node_modules to the root directory.
- Do NOT run npm install and create a package-lock.json in the root directory. Do not push *.json files to the root directory.
- We are using npm (node package manager). Do not run yarn or pnpm commands, and never attempt to push files created by
these other package managers.