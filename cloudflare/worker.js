export default {
  // Scheduled Cron Trigger: Runs every 10 minutes to prevent container sleep
  async scheduled(event, env, ctx) {
    const targetUrl = env.TARGET_URL || "https://discord-247-afk-worker.onrender.com";
    try {
      const res = await fetch(targetUrl);
      console.log(`[Cloudflare Cron] Pinged ${targetUrl} - Status: ${res.status}`);
    } catch (err) {
      console.error(`[Cloudflare Cron] Ping failed: ${err.message}`);
    }
  },

  // HTTP Endpoint: Test pings anytime by visiting your Cloudflare Worker URL
  async fetch(request, env, ctx) {
    const targetUrl = env.TARGET_URL || "https://discord-247-afk-worker.onrender.com";
    try {
      const start = Date.now();
      const res = await fetch(targetUrl);
      const duration = Date.now() - start;
      const data = await res.text();
      return new Response(
        JSON.stringify({
          status: "success",
          target: targetUrl,
          http_status: res.status,
          latency_ms: duration,
          worker_response: data
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          status: "error",
          target: targetUrl,
          message: err.message
        }, null, 2),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
