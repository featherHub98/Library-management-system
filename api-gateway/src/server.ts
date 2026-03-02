import express, { Express, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import consul from "consul";
import cors from "cors";

const PORT = 8080;
const SERVICE_NAME = "gateway";

const app: Express = express();
app.use(cors());
app.use(express.json());

const SERVICE_URLS: Record<string, string> = {
  "auth-service": "http://localhost:3001",
  "book-service": "http://localhost:3002",
  "config-server": "http://localhost:8888",
};

const consulClient = new consul({
  host: "localhost",
  port: 8500,
});

interface ConsulService {
  Service: string;
  Address: string;
  Port: number;
  ID: string;
  Tags?: string[];
}

const registerService = async () => {
  try {
    await consulClient.agent.service.register({
      name: SERVICE_NAME,
      id: `${SERVICE_NAME}-${PORT}`,
      address: "localhost",
      port: PORT,
      check: {
        name: `${SERVICE_NAME}-health`,
        http: `http://localhost:${PORT}/health`,
        interval: "10s",
        timeout: "5s",
      },
    });
    console.log("Gateway registered in Consul");
  } catch (err) {
    console.warn("Failed to register gateway in Consul, using fallback URLs");
  }
};

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

const getServiceUrl = async (serviceName: string): Promise<string> => {
  try {
    const services = (await consulClient.agent.service.list()) as Record<string, ConsulService>;
    const serviceEntry = Object.values(services).find((s) => s.Service === serviceName);

    if (serviceEntry) {
      const host = serviceEntry.Address || "localhost";
      const url = `http://${host}:${serviceEntry.Port}`;
      console.log(`Found ${serviceName} in Consul: ${url}`);
      return url;
    }
  } catch (err) {
    console.warn(`Consul lookup failed for ${serviceName}, using fallback`);
  }

  const fallbackUrl = SERVICE_URLS[serviceName];
  if (fallbackUrl) {
    console.log(`Using fallback URL for ${serviceName}: ${fallbackUrl}`);
    return fallbackUrl;
  }

  throw new Error(`Service ${serviceName} not found and no fallback URL available`);
};

// Auth routes
app.use("/api/auth", async (req, res, next) => {
  try {
    const target = await getServiceUrl("auth-service");
    console.log(`Gateway routing /api/auth -> ${target}`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/auth": "" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Auth service proxy error:", err.message);
        res.status(503).json({ error: "Auth service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

// Books routes
app.use("/api/books", async (req, res, next) => {
  try {
    const target = await getServiceUrl("book-service");
    console.log(`Gateway routing /api/books -> ${target}`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/books": "/books" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Book service proxy error:", err.message);
        res.status(503).json({ error: "Book service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

// Authors routes
app.use("/api/authors", async (req, res, next) => {
  try {
    const target = await getServiceUrl("book-service");
    console.log(`Gateway routing /api/authors -> ${target}`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/authors": "/authors" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Author service proxy error:", err.message);
        res.status(503).json({ error: "Author service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

// Wishlist routes - book-service mounts them at /user/wishlist
app.use("/api/wishlist", async (req, res, next) => {
  try {
    const target = await getServiceUrl("book-service");
    console.log(`Gateway routing /api/wishlist -> ${target}/user/wishlist`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/wishlist": "/user/wishlist" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Wishlist service proxy error:", err.message);
        res.status(503).json({ error: "Wishlist service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

// Borrowing routes - book-service mounts them at /borrowing
app.use("/api/borrow", async (req, res, next) => {
  try {
    const target = await getServiceUrl("book-service");
    console.log(`Gateway routing /api/borrow -> ${target}/borrowing`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/borrow": "/borrowing" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Borrow service proxy error:", err.message);
        res.status(503).json({ error: "Borrow service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

// Notifications routes
app.use("/api/notifications", async (req, res, next) => {
  try {
    const target = await getServiceUrl("book-service");
    console.log(`Gateway routing /api/notifications -> ${target}/notifications`);

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { "^/api/notifications": "/notifications" },
      timeout: 30000,
      proxyTimeout: 30000,
      logLevel: "warn",
      onError: (err, req, res) => {
        console.error("Notifications service proxy error:", err.message);
        res.status(503).json({ error: "Notifications service unavailable", details: err.message });
      }
    })(req, res, next);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(503).json({ error: message });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Service URLs (fallback):`);
  Object.entries(SERVICE_URLS).forEach(([name, url]) => {
    console.log(`   ${name}: ${url}`);
  });
  await registerService();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
