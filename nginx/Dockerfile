FROM nginx:alpine

# Install certbot for Let's Encrypt (production)
RUN apk add --no-cache certbot certbot-nginx

# Copy nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Copy frontend build
COPY ../frontend/dist /usr/share/nginx/html

# Create necessary directories
RUN mkdir -p /var/www/certbot /var/log/nginx /var/cache/nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
