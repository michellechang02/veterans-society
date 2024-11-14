## CIS 4000: Veterans Society

TypeScript + Vite (frontend) : https://veterans-society.vercel.app/


FastAPI (backend): https://veterans-society-backend.vercel.app/


## How It Works

The Python/FastAPI server is mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/digitros/nextjs-fastapi/blob/main/next.config.js) to map any request to `/api/py/:path*` to the FastAPI API, which is hosted in the `/api` folder.

Also, the app/api routes are available on the same domain, so you can use NextJs Route Handlers and make requests to `/api/...`.

On localhost, the rewrite will be made to the `127.0.0.1:8000` port, which is where the FastAPI server is running.

In production, the FastAPI server is hosted as [Python serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python) on Vercel.



## Getting Started

First, create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).


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

# Running the application backend and frontend
Before running, make sure you installed dependencies. In veterans-society folder, run:
```
 pip install -r requirements.txt
```
In api/ run:
```
python3 -m venv venv
source venv/bin/activate
```

In veterans-society:
```
uvicorn api.main:app --reload   
```
Otherwise python will not be able to create and read the correct packages.

Open another terminal
```
cd frontend
npm run dev
```
