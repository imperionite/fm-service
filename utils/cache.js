const config = require("./config");
const redis = require('redis');

// Create the Redis client
const client = redis.createClient({
  url: config.redis_url,  // Use the URL from your config
  socket: {
    tls: process.env.NODE_ENV === 'production',  // Enable TLS only in production
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

client.connect();  // Connect to Redis

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const cacheMethodCalls = (
  object,
  methodsToFlushCacheWith = [],
  cacheExpirySeconds = 60
) => {
  const handler = {
    get: (module, methodName) => {
      const method = module[methodName];
      if (typeof method !== 'function') {
        return method;
      }
      return async (...methodArgs) => {
        if (methodsToFlushCacheWith.includes(methodName)) {
          try {
            await client.flushDb();  // Flush Redis DB
          } catch (err) {
            console.error('Redis flushDb error:', err);
          }
          return await method.apply(module, methodArgs);
        }

        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;
        try {
          const cacheResult = await client.get(cacheKey);  // Get cached value
          if (cacheResult) {
            return JSON.parse(cacheResult);  // Return the parsed cache value if available
          }
        } catch (err) {
          console.error('Redis get error:', err);
        }

        const result = await method.apply(module, methodArgs);

        try {
          await client.setEx(
            cacheKey,
            cacheExpirySeconds,  // Cache expiration time in seconds
            JSON.stringify(result)  // Set the result in Redis as a JSON string
          );
        } catch (err) {
          console.error('Redis setEx error:', err);
        }

        return result;
      };
    },
  };

  return new Proxy(object, handler);
};

module.exports = { cacheMethodCalls };
