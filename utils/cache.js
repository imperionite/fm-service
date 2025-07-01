const redis = require("redis");
const config = require("./config");

let client;

// Conditionally create Redis client based on environment
if (process.env.NODE_ENV === "test") {
  // Create a simple in-memory mock client for testing with node-redis
  // This mock will store data in a local Map and mimic Redis client behavior.
  const mockRedisStore = new Map(); // Use a Map to store key-value pairs in memory
  const mockRedisClient = {
    connected: true, // Always consider it "connected" for tests
    connect: async () => {
      console.log("Mock Redis client connected (in-memory).");
      // Simulate connection events if needed for specific tests
      // For now, just resolve
    },
    on: (event, handler) => {
      // Mock 'on' method for event listeners.
      // For testing, we might not need to trigger these, but it prevents errors.
      if (event === 'connect') {
        // Immediately call handler for 'connect' to simulate instant connection
        // This might be needed if your app logic relies on the 'connect' event for readiness
        // handler();
      }
    },
    get: async (key) => {
      // Simulate async get operation
      return mockRedisStore.get(key) || null;
    },
    setEx: async (key, seconds, value) => {
      // Simulate async setEx operation
      mockRedisStore.set(key, value);
      // In a real mock, you might implement a setTimeout to clear after 'seconds'
      // For basic unit tests, this is often not necessary.
      return "OK";
    },
    flushDb: async () => {
      // Simulate async flushDb operation
      mockRedisStore.clear();
      return "OK";
    },
    // Add any other Redis client methods your application uses and needs to mock
    // For example:
    // del: async (key) => { mockRedisStore.delete(key); return 1; },
    // hgetall: async (key) => { /* ... */ },
  };
  client = mockRedisClient;
  console.log("Using in-memory mock Redis client for test environment.");
} else if (process.env.NODE_ENV === "production") {
  client = redis.createClient({
    socket: {
      host: config.redis_host,
      port: config.redis_port,
    },
    username: config.redis_username,
    password: config.redis_password,
  });
  console.log("Using real Redis client for production.");
} else {
  // Default to development settings (e.g., local Redis via URL)
  client = redis.createClient({
    url: config.redis_url,
  });
  console.log("Using real Redis client for development.");
}

// Ensure client.connect() is called for both real Redis and the mock.
// The mock client's connect method will simply resolve.
client.connect();

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Cache method calls logic
const cacheMethodCalls = (
  object,
  methodsToFlushCacheWith = [],
  cacheExpirySeconds = 60
) => {
  const handler = {
    get: (module, methodName) => {
      const method = module[methodName];
      if (typeof method !== "function") {
        return method;
      }
      return async (...methodArgs) => {
        // Check if we need to flush cache for this method
        if (methodsToFlushCacheWith.includes(methodName)) {
          try {
            // The mock client is "connected" in test env, real client checks client.connected
            if (client.connected || process.env.NODE_ENV === "test") {
              await client.flushDb(); // Flush the Redis DB
            }
          } catch (err) {
            console.error("Redis flushDb error:", err);
          }
          return await method.apply(module, methodArgs);
        }

        // Generate the cache key based on method and arguments
        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;

        let cacheResult = null;
        try {
          // Attempt to retrieve the cached value
          if (client.connected || process.env.NODE_ENV === "test") {
            cacheResult = await client.get(cacheKey);
          }
          if (cacheResult) {
            return JSON.parse(cacheResult); // Return the parsed cached value
          }
        } catch (err) {
          console.error("Redis get error:", err);
        }

        // If not found in cache, call the actual method
        const result = await method.apply(module, methodArgs);

        try {
          // Cache the result for future use
          if (client.connected || process.env.NODE_ENV === "test") {
            await client.setEx(
              cacheKey,
              cacheExpirySeconds, // Cache expiration in seconds
              JSON.stringify(result) // Set the result as a JSON string
            );
          }
        } catch (err) {
          console.error("Redis setEx error:", err);
        }

        return result;
      };
    },
  };

  // Return a Proxy that intercepts method calls for caching
  return new Proxy(object, handler);
};

module.exports = { cacheMethodCalls };
