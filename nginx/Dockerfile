FROM nginx:alpine

# Install certbot for Let's Encrypt (production) and wget for health checks
RUN apk add --no-cache certbot certbot-nginx wget

# Copy nginx configuration from build context
COPY nginx/nginx.prod.conf /etc/nginx/conf.d/default.conf

# Create necessary directories
RUN mkdir -p /var/www/certbot /var/log/nginx /var/cache/nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
