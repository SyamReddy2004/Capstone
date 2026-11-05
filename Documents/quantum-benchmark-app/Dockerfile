FROM python:3.10-slim

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app

# Copy project files
COPY . .

# Build Frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Install Backend dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi uvicorn pydantic

# Run Backend (which now also serves the frontend)
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]