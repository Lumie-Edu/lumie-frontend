# Lumie Frontend Development with Tilt
# =====================================
# Usage: tilt up
# Access: https://dev.lumie0213.kro.kr

REGISTRY = 'zot0213.kro.kr'
NAMESPACE = 'lumie-dev'
DEV_DOMAIN = 'dev.lumie0213.kro.kr'

# Environment variables
ENV_VARS = {
    'NODE_ENV': 'development',
    'NEXT_TELEMETRY_DISABLED': '1',
    'NODE_OPTIONS': '--max-old-space-size=1536',
}

def generate_env_yaml():
    env_yaml = ''
    for key, value in ENV_VARS.items():
        env_yaml += '''
        - name: %s
          value: "%s"''' % (key, value)
    return env_yaml

# Deployment YAML
deployment_yaml = '''
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lumie-frontend
  namespace: %s
  labels:
    app: lumie-frontend
    environment: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: lumie-frontend
  template:
    metadata:
      labels:
        app: lumie-frontend
        environment: development
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: lumie-frontend
        image: %s/dev/lumie-frontend
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:%s
        resources:
          requests:
            cpu: 50m
            memory: 50Mi
          limits:
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
              - ALL
''' % (NAMESPACE, REGISTRY, generate_env_yaml())

# Service YAML
service_yaml = '''
apiVersion: v1
kind: Service
metadata:
  name: lumie-frontend
  namespace: %s
spec:
  type: ClusterIP
  selector:
    app: lumie-frontend
  ports:
  - name: http
    port: 3000
    targetPort: http
    protocol: TCP
''' % NAMESPACE

# Ingress YAML (Kong)
ingress_yaml = '''
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lumie-frontend-ingress
  namespace: %s
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    konghq.com/plugins: lumie-dev-cors
spec:
  ingressClassName: kong
  tls:
  - hosts:
    - %s
    secretName: lumie-dev-tls
  rules:
  - host: %s
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lumie-frontend
            port:
              number: 3000
''' % (NAMESPACE, DEV_DOMAIN, DEV_DOMAIN)

# CORS Plugin for development
cors_plugin_yaml = '''
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: lumie-dev-cors
  namespace: %s
config:
  origins:
  - "https://%s"
  - "http://%s"
  methods:
  - GET
  - POST
  - PUT
  - PATCH
  - DELETE
  - OPTIONS
  headers:
  - Accept
  - Authorization
  - Content-Type
  - X-Tenant-Slug
  exposed_headers:
  - X-Request-Id
  credentials: true
  max_age: 3600
plugin: cors
''' % (NAMESPACE, DEV_DOMAIN, DEV_DOMAIN)

# Combine all YAML for frontend
combined_yaml = deployment_yaml + '\n---\n' + service_yaml + '\n---\n' + ingress_yaml + '\n---\n' + cors_plugin_yaml

# Apply YAML using k8s_yaml (handles automatic image tag injection)
k8s_yaml(blob(combined_yaml))

# Docker build with live_update (true hot reload for Next.js)
docker_build(
    '%s/dev/lumie-frontend' % REGISTRY,
    context='.',
    dockerfile='Dockerfile.dev',
    live_update=[
        # Fall back to full rebuild only for Dockerfile changes
        fall_back_on(['Dockerfile.dev']),
        # Sync source directories
        sync('./app', '/app/app'),
        sync('./src', '/app/src'),
        sync('./components', '/app/components'),
        sync('./hooks', '/app/hooks'),
        sync('./lib', '/app/lib'),
        sync('./public', '/app/public'),
        # Sync config files
        sync('./next.config.ts', '/app/next.config.ts'),
        sync('./tsconfig.json', '/app/tsconfig.json'),
        sync('./postcss.config.mjs', '/app/postcss.config.mjs'),
        sync('./components.json', '/app/components.json'),
        sync('./middleware.ts', '/app/middleware.ts'),
        # Reinstall dependencies if package.json changes, then restart
        run('cd /app && npm install', trigger=['package.json', 'package-lock.json']),
    ],
    ignore=[
        'node_modules',
        '.next',
        '.git',
        'test-results',
        'playwright-report',
        'e2e',
        '*.log',
        '.env*',
        'tsconfig.tsbuildinfo',
    ],
)

k8s_resource(
    'lumie-frontend',
    # No port-forward needed - access via https://dev.lumie0213.kro.kr
    labels=['lumie-dev'],
)
