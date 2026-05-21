const usageMap = new Map();
const FREE_LIMIT = 5;

function getTodayKey(clientId) {
  const today = new Date().toDateString();
  return `${clientId}:${today}`;
}

function getClientCount(clientId) {
  const key = getTodayKey(clientId);
  return usageMap.get(key) || 0;
}

function incrementClient(clientId) {
  const key = getTodayKey(clientId);
  usageMap.set(key, (usageMap.get(key) || 0) + 1);
}

export function checkRateLimit(req, res, next) {
  const clientId = req.headers['x-client-id'] || req.ip || 'anonymous';
  const count = getClientCount(clientId);

  if (count >= FREE_LIMIT) {
    return res.status(429).json({
      error: 'Daily scan limit reached',
      limit: FREE_LIMIT,
      used: count,
      upgradeRequired: true,
      message: `You've used all ${FREE_LIMIT} free scans for today. Upgrade to FlipRadar Pro for unlimited scans.`
    });
  }

  incrementClient(clientId);
  next();
}

export function getRateLimitInfo(clientId) {
  const used = getClientCount(clientId);
  return {
    used,
    limit: FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - used)
  };
}
