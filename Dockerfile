# ===================================================
# Stage 1: Build Frontend (React + Vite)
# ===================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ===================================================
# Stage 2: Runtime Environment (FastAPI + Python)
# ===================================================
FROM python:3.11-slim
WORKDIR /app

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend dist from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Run uvicorn on $PORT (dynamically assigned by Render / Railway / Heroku / Koyeb)
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
