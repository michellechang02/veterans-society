# Use Python 3.9 slim image as base
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -m nltk.downloader punkt averaged_perceptron_tagger stopwords wordnet

# Copy the backend application code
COPY ./api ./api
COPY ./main.py .

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000
# These will be overridden by docker run --env-file
ENV secret_login_key=default_secret_key
ENV S3_BUCKET_NAME=default_bucket_name

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
