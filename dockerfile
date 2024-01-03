FROM openjdk:11-jdk

RUN apt-get update && apt-get install -y python3-pip python3-dev build-essential

# Install JPype using pip
RUN pip3 install --no-cache-dir JPype1

WORKDIR /app
COPY . /app
RUN pip3 --no-cache-dir install -r requirements.txt

CMD ["python3", "app.py"]