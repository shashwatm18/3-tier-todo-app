# 1. Use an official, lightweight Python base image
FROM python:3.12-slim

# 2. Set environment variables
# Prevents Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr (useful for real-time logging)
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Install dependencies separately to leverage Docker layer caching
# Copy only the requirements file first
COPY requirements.txt .

# Install dependencies without saving the pip cache to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application source code into the container
COPY . .

# 6. Expose the port your application listens on (e.g., 8000)
EXPOSE 8000

# 7. Create a non-root user and switch to it for enhanced security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# 8. Define the command to execute your application
# Replace "main:app" with your entry point (e.g., ["python", "app.py"] for basic scripts)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
