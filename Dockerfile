# moshcode.sh on Bun. Contract with dev2, unchanged from the Node image: listens on
# $PORT (3000) on $HOST, answers /healthz, no secrets needed.
FROM oven/bun:1.4.0-slim
WORKDIR /app
COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile --production
# --chown: dev2's checkout is group-only (660/2770) and COPY keeps those modes.
COPY --chown=bun:bun src ./src
COPY --chown=bun:bun public ./public
COPY --chown=bun:bun data ./data
USER bun
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["bun", "src/server.mjs"]
