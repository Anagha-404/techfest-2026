# Experiment 5 — Security, Version Control, CI/CD and Cloud Deployment

The code changes are already done. This guide covers what you do yourself: the demos, Git, accounts, deploying, and screenshots.

```
react-project/                  <- Git repository root
├── .github/workflows/ci.yml    CI pipeline (backend tests + frontend lint/build)
├── .gitignore                  node_modules, .env, dist never committed
├── netlify.toml                Netlify build + security headers (CSP)
├── render.yaml                 Render blueprint for the API
├── techfest-backend/           Express + MongoDB API (Render)
│   ├── app.js                  app + security middleware (tests import this)
│   ├── server.js               connects DB, starts server
│   ├── middleware/             auth, sanitize, validate, logger, errorHandler
│   ├── models/  routes/        + Feedback model/route (for XSS demo)
│   ├── tests/app.test.js       Jest + Supertest (10 tests)
│   └── .env.example
└── techfest2026-react/         React SPA (Netlify)
    ├── public/_redirects       /api -> Render proxy + SPA fallback
    └── src/api.js, context/AuthContext.jsx, pages/MyRegistrations.jsx ...
```

## 0. Run locally

```bash
# terminal 1
cd techfest-backend
npm install
npm run dev            # http://localhost:5000

# terminal 2
cd techfest2026-react
npm install
npm run dev            # http://localhost:5173  (/api is proxied to :5000)
```

> **Admin account:** creating, editing and deleting events now needs `role: "admin"`. In Compass, open `techfest.users`, edit your user and change `role` from `student` to `admin`, then log in again.

> **Login change:** the JWT is now in an **httpOnly cookie**, not localStorage. In Postman, cookies are kept automatically after you call `/api/auth/login`.

---

## 1. Security fixes (Q1, Q2) — demos for the record

Do the "before" steps on a **test copy** of the Experiment 4 code (copy the folder before you use the new code), and the "after" steps on the new code.

### A. NoSQL injection (login bypass)

| | |
|---|---|
| **Attack** | `POST /api/auth/login` with body `{"email": {"$regex": ".*"}, "password": "pass1234"}` |
| **Before** (Exp 4 code) | `{"$regex": ".*"}` matches **any** email, so you are logged in as the first user without knowing their email → 200 + token |
| **After** | **400 Validation failed**: `express-validator` rejects non-string email, and `middleware/sanitize.js` strips `$` keys |
| **Fix** | `express-mongo-sanitize` + `express-validator` on every route |

Note: the manual says `app.use(mongoSanitize())`. That line **crashes on Express 5** (`req.query` is read-only), so `middleware/sanitize.js` calls the package's `sanitize()` function on `req.body` and `req.params` instead. Write this in your record.

### B. Cross-Site Scripting (XSS)

1. **Before:** in the test copy's `Contact.jsx`, replace `<p>{f.message}</p>` with
   `<p dangerouslySetInnerHTML={{ __html: f.message }} />`
2. Submit feedback: `<img src=x onerror="alert('hi')">` → an alert pops up. Screenshot it.
   (A plain `<script>alert('hi')</script>` added through innerHTML is **never run** by browsers, so use the `<img onerror>` version for the demo.)
3. **After:** the real code uses `{f.message}`. React escapes it, so the text shows as plain characters. Screenshot it.
4. On the deployed site, the **CSP header** in `netlify.toml` (`script-src 'self'`) also blocks inline handlers, which is a second layer of protection.

### C. Secure authentication (Q2)

| Measure | Where |
|---|---|
| bcrypt password hashing | `routes/auth.js` |
| JWT in `httpOnly` + `secure` + `sameSite=strict` cookie | `routes/auth.js` (`cookieOptions`) |
| Strong password rule (8+, letter + number) | backend + `Registration.jsx` |
| Rate limit on login/register (100 per 15 min) | `app.js` (`express-rate-limit`) |
| Admin-only event CRUD, admin-only "all registrations" | `middleware/auth.js` (`adminOnly`) |
| Mass-assignment block (extra fields ignored; role cannot be set at signup) | `routes/events.js`, `routes/auth.js` |
| Helmet security headers, 10 kb body limit, CORS limited to `CLIENT_URL` | `app.js` |
| No error details leaked in production | `middleware/errorHandler.js` |
| HTTPS everywhere | Render + Netlify give HTTPS automatically |

**CSRF, in brief:** a malicious site makes your browser send a request to our API, and the browser attaches your login cookie automatically. `sameSite=strict` tells the browser **not to send the cookie on requests started by another site**, so the forged request arrives without login and gets a 401.
Netlify forwards `/api/*` to Render (`_redirects`), so the browser sees **one site** and the strict cookie still works in production.

---

## 2. Git: branching, merging, conflict (Q3)

Run these from the `react-project` folder:

```bash
git init
git branch -M main
git status                 # check that .env and node_modules are NOT listed
git add .
git commit -m "Experiment 5: secured TechFest portal"

# --- branch + merge ---
git checkout -b feature-page
# make a small change, e.g. edit the Contact page phone number
git commit -am "Update contact details"
git checkout main
git merge feature-page

# --- merge conflict on purpose ---
git checkout -b feature-title
# change the <title> line in techfest2026-react/index.html to "TechFest 2026 - Register Now"
git commit -am "Change title on feature branch"
git checkout main
# change the SAME <title> line to "TechFest 2026 - MBCET Fest"
git commit -am "Change title on main"
git merge feature-title    # CONFLICT
# open index.html, keep one line, delete <<<<<<< ======= >>>>>>> markers
git add techfest2026-react/index.html
git commit -m "Resolve title merge conflict"

git log --oneline --graph --all     # screenshot this for the record
```

Upload to GitHub: create an **empty** repo (no README), then:

```bash
git remote add origin https://github.com/<your-username>/techfest-2026.git
git push -u origin main
```

---

## 3. CI pipeline (Q4)

`.github/workflows/ci.yml` runs on every push:
- **backend:** `npm ci` → `npm test` (Jest + Supertest: health, 404, Helmet headers, validation, injection blocked, 401 on protected routes)
- **frontend:** `npm ci` → `npm run lint` → `npm run build`

**Red/green demo:** in `techfest-backend/tests/app.test.js` change `toBe(200)` to `toBe(500)` in the first test → commit → push → **Actions** tab shows a red ❌ (screenshot). Undo it → push → green ✅ (screenshot).

**CD:** Render and Netlify both redeploy automatically on each push to `main`.

---

## 4. Deploy (Q5)

### MongoDB Atlas (database)
1. Create a free **M0** cluster.
2. **Database Access** → add a user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (Render uses changing IPs).
4. **Connect → Drivers** → copy the string and add the DB name:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/techfest`

### Render (backend)
1. **New → Web Service** → connect the GitHub repo.
2. Root Directory `techfest-backend`, Build `npm ci`, Start `npm start`, Health check `/api/health`.
3. Environment variables:
   - `MONGO_URI` = Atlas string
   - `JWT_SECRET` = long random value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your Netlify URL (add it after step 5)
4. Check `https://<name>.onrender.com/api/health` → `{"status":"ok"}`.
   (The free plan sleeps after 15 min idle, so the first request can take about 50 s.)

### Netlify (frontend)
1. Edit `techfest2026-react/public/_redirects`: replace `https://techfest-api.onrender.com` with **your** Render URL. Commit and push.
2. **Add new site → Import from GitHub**. `netlify.toml` fills in the settings (base `techfest2026-react`, build `npm run build`, publish `dist`).
3. Open the site, register, then check in Atlas → Browse Collections that the user appears. Confirm the 🔒 https padlock.

*Environment variable option:* the app also reads `VITE_API_URL`. Leave it **empty** when using the `_redirects` proxy (recommended). If you set it to call Render directly, you must also set `COOKIE_SAMESITE=none` on Render and add the Render URL to `connect-src` in `netlify.toml`, which weakens CSRF protection.

---

## 5. Performance (Q6, Q7)

Changes made:
- **Lazy-loaded routes** (`React.lazy` + `Suspense` in `App.jsx`): each page is its own chunk
- **Lazy images** (`loading="lazy"`, `width`/`height`, descriptive `alt`) in `Gallery.jsx`
- **gzip compression** on API responses (`compression`)
- **Long-term caching** of hashed `/assets/*` (`netlify.toml`)
- `<meta name="description">`, proper `<title>`, form `<label htmlFor>` (Lighthouse SEO and accessibility)

Build output after the change (`npm run build`):

| File | Size | gzip |
|---|---|---|
| main bundle `index-*.js` | 235.6 kB | 75.4 kB |
| Events page chunk | 2.2 kB | 1.0 kB |
| Registration chunk | 2.2 kB | 0.9 kB |
| Contact / MyRegistrations / Login / Gallery / NotFound | 0.2–1.5 kB each | |

For the "before" size, run `npm run build` on your Exp 4 copy and note the single `index-*.js` size.

**Lighthouse:** run it in an **Incognito** window (extensions skew the score). DevTools → Lighthouse → Mobile → Analyze. Save the report as HTML or PDF. Fix ≥ 4 items (examples already fixed: meta description, image alt text, explicit image dimensions, form labels, caching headers), re-run it, and record the scores before and after in a table. Also capture the **Network** tab (gzip `content-encoding`, chunk sizes) and the **Performance** tab.

## 6. Cross-device check (Q8)

Test on Chrome, Edge/Firefox, and a real phone (open the Netlify URL), plus the DevTools device toolbar (iPhone, iPad, desktop). Check that navigation, login, event registration, and refreshing on `/events` (no 404) all work. A table of browser/device × feature × ✓ works well in the record.

## 7. Deployment report (Q9)

```
 Browser ──HTTPS──> Netlify (React build, CSP headers)
                       │  /api/*  (proxy, same site → SameSite=Strict cookie)
                       ▼
                    Render (Express API: Helmet, validation, JWT cookie)
                       │  mongodb+srv (TLS)
                       ▼
                    MongoDB Atlas (users, events, registrations, feedbacks)
```

Include: the three URLs (Netlify site, Render API `/api/health`, Atlas cluster name), the security table with before/after screenshots, the `git log --graph` and a green CI screenshot, Lighthouse before/after, and live-site screenshots.
