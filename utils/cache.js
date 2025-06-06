const config = require("./config");
const Redis = require("ioredis");

const redis = new Redis(config.redis_url);

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
        if (methodsToFlushCacheWith.includes(methodName)) {
          try {
            await redis.flushdb();
          } catch (err) {
            console.error("Redis flushdb error:", err);
          }
          return await method.apply(module, methodArgs);
        }

        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;
        try {
          const cacheResult = await redis.get(cacheKey);
          if (cacheResult) {
            return JSON.parse(cacheResult);
          }
        } catch (err) {
          console.error("Redis get error:", err);
        }

        const result = await method.apply(module, methodArgs);

        try {
          await redis.set(
            cacheKey,
            JSON.stringify(result),
            "EX",
            cacheExpirySeconds
          );
        } catch (err) {
          console.error("Redis set error:", err);
        }

        return result;
      };
    },
  };

  return new Proxy(object, handler);
};

module.exports = { cacheMethodCalls };
