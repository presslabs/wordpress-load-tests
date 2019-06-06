FROM loadimpact/k6

RUN mkdir /app
COPY scenarios /app
