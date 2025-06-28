const redis = require("redis");
const config = require("./config");

let client;

if (process.env.NODE_ENV === "production") {
  client = redis.createClient({
    socket: {
      host: config.redis_host,
      port: config.redis_port,
      tls: true
    },
    username: config.redis_username,
    password: config.redis_password,
  });
} else {
  client = redis.createClient({
    url: config.redis_url,
  });
}

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
            await client.flushDb(); // Flush the Redis DB
          } catch (err) {
            console.error("Redis flushDb error:", err);
          }
          return await method.apply(module, methodArgs);
        }

        // Generate the cache key based on method and arguments
        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;

        try {
          // Attempt to retrieve the cached value
          const cacheResult = await client.get(cacheKey);
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
          await client.setEx(
            cacheKey,
            cacheExpirySeconds, // Cache expiration in seconds
            JSON.stringify(result) // Set the result as a JSON string
          );
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
