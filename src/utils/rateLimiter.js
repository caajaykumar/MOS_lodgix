// Simple in-process rate limiter (token bucket) shared by API routes
// Limits to max 3 requests per second across this process.

const DEFAULT_RPS = 3;
const INTERVAL_MS = 1000;

class RateLimiter {
  constructor(rps = DEFAULT_RPS) {
    this.capacity = rps;
    this.tokens = rps;
    this.queue = [];
    this.timer = setInterval(() => this.refill(), INTERVAL_MS);
    this.timer.unref && this.timer.unref();
  }

  refill() {
    this.tokens = this.capacity;
    this.drain();
  }

  drain() {
    while (this.tokens > 0 && this.queue.length > 0) {
      this.tokens--;
      const next = this.queue.shift();
      next();
    }
  }

  schedule() {
    return new Promise((resolve) => {
      const tryNow = () => resolve();
      if (this.tokens > 0) {
        this.tokens--;
        resolve();
      } else {
        this.queue.push(tryNow);
      }
    });
  }
}

// Singleton instance reused across imports
const globalKey = '__lodgix_rate_limiter__';
if (!global[globalKey]) {
  global[globalKey] = new RateLimiter(process.env.LODGIX_RPS ? Number(process.env.LODGIX_RPS) : DEFAULT_RPS);
}

export default global[globalKey];
