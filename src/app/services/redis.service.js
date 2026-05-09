const redis = require('redis');

const client = redis.createClient();

client.on('error', err => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connecting...'));
client.on('ready', () => console.log('Redis ready'));
let isConnecting = false;
const connectRedis = async () => {
  try {
    if (client.isOpen) return;
    if (!isConnecting) {
      isConnecting = true;
      await client.connect();
      isConnecting = false;
    }
  } catch (err) {
    isConnecting = false;
    console.error('Redis connect failed:', err.message);
  }
};

const safeDel = async key => {
  try {
    if (client.isOpen) await client.del(key);
  } catch (err) {
    console.error('Redis DEL error:', err.message);
  }
};

module.exports = { client, connectRedis, safeDel };
