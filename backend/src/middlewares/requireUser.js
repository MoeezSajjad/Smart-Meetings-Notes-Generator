// Verify ID tokens through Firebase Identity Toolkit, not browser localStorage.
export async function requireUser(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return res.status(401).json({error:'Authentication required'});
  try {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(process.env.FIREBASE_API_KEY), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({idToken:token}), signal:AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(401).json({error:'Invalid session'});
    const user = (await response.json()).users?.[0];
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (!user?.localId || user.disabled || claims.aud !== process.env.FIREBASE_PROJECT_ID || claims.iss !== 'https://securetoken.google.com/' + process.env.FIREBASE_PROJECT_ID || claims.sub !== user.localId || claims.exp <= Date.now()/1000) return res.status(401).json({error:'Invalid session'});
    const allowed = (process.env.DEMO_ALLOWED_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    if ((process.env.NODE_ENV === 'production' || allowed.length) && (!user.emailVerified || !allowed.includes(user.email?.toLowerCase()))) return res.status(403).json({error:'Demo access restricted'});
    req.user = {uid:user.localId};
    next();
  } catch { return res.status(503).json({error:'Authentication unavailable'}); }
}
let windowStart = Date.now(), total = 0;
const counts = new Map();
export function limitUploads(req,res,next) {
  if (Date.now()-windowStart >= 3600000) {windowStart=Date.now();total=0;counts.clear();}
  const count = counts.get(req.user.uid)||0;
  if (count>=3 || total>=12) return res.status(429).json({error:'Demo upload quota exceeded'});
  counts.set(req.user.uid,count+1);total++;next();
}
