# Use Node.js LTS
FROM node:20.19.0

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

# Create app directory
WORKDIR /usr/src/mmrrc-ddb-api

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

# Change ownership to non-root user
RUN chown -R nodeuser:nodeuser /usr/src/mmrrc-ddb-api
USER nodeuser

# Set to production for performance benefits
ENV NODE_ENV=production

# Expose port (Required for Google Cloud Run)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
CMD node -e "http.get('http://localhost:8080/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start app
CMD ["node", "app.js"]
