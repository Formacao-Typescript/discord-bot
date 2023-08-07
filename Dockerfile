FROM denoland/deno:alpine

RUN mkdir /app

WORKDIR /app

COPY src/deps.ts /app/src/
RUN deno cache /app/src/deps.ts

COPY src/ /app/src/
COPY .env.example deno.json deno.lock /app/

CMD ["run", "-A", "src/mod.ts"]