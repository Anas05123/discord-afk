FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY afk_worker.py keep_alive.py ./

ENV PORT=10000
EXPOSE 10000

CMD ["python", "-u", "afk_worker.py"]
