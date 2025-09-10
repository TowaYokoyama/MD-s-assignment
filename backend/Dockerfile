FROM python:3.10-slim

WORKDIR /app

#COPY ./requirements.txt /app/requirements.txt
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY backend/app/ app/
COPY backend/tests/ tests

CMD ["uvicorn","app.main:app", "--host", "0.0.0.0", "--port","8000"]