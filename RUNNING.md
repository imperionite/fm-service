# fm-service

```sh
# Express/Mongo & Redis
const mongoUri = 'mongodb://myuser:mypassword@127.0.0.1:37017/mydatabase?authSource=admin';

# Entering inside MongoDB container
docker ps
docker exec -it <container_name_or_id> mongosh -u myuser -p mypassword --authenticationDatabase admin
use mydatabase
show collections
# Query documents from a collection, e.g., services:
db.services.find().pretty()
# exit shell
exit

# redis or ioredis
const redis = require('redis');
const client = redis.createClient({
     url: 'redis://:devpassword@127.0.0.1:7379'
   });

client.connect()
.then(() => console.log('Connected to Redis'))
.catch(console.error);

```
