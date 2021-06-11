FROM python:2.7.18-buster
WORKDIR /app
RUN virtualenv /env
COPY requirements.txt .
RUN /env/bin/pip install -r requirements.txt
COPY bin/init-app.sh /env
COPY . .
EXPOSE 8000
CMD /env/init-app.sh

