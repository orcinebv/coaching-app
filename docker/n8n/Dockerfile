FROM n8nio/n8n:latest

USER root
COPY --chown=node:node workflows/ /n8n-import/workflows/
COPY --chown=node:node entrypoint.sh /n8n-import/entrypoint.sh
RUN chmod +x /n8n-import/entrypoint.sh
USER node

ENTRYPOINT ["/n8n-import/entrypoint.sh"]
