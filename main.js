const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const comments = [];

// Shared cinematic glass CSS
const glassCSS = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 0;
      padding: 2rem;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: linear-gradient(120deg, #a1c4fd, #c2e9fb);
      overflow: hidden;
    }
    /* Animated gradient background */
    body::before {
      content: "";
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%),
                  radial-gradient(circle at 80% 30%, rgba(255,255,255,0.3), transparent 40%),
                  radial-gradient(circle at 50% 80%, rgba(255,255,255,0.2), transparent 40%);
      animation: float 20s linear infinite;
      z-index: -1;
    }
    @keyframes float {
      0% { transform: translate(0,0) rotate(0deg); }
      50% { transform: translate(10%, -10%) rotate(180deg); }
      100% { transform: translate(0,0) rotate(360deg); }
    }
    .glass {
      background: rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 2rem;
      max-width: 700px;
      width: 100%;
      animation: fadeIn 1s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    h1, h2 {
      margin-top: 0;
      color: #111;
      text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    }
    a {
      color: #007aff;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover { text-decoration: underline; }
    input, button, textarea {
      margin: 0.25rem 0;
      padding: 0.6rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.1);
      backdrop-filter: blur(6px);
      font-size: 1rem;
    }
    button {
      background: rgba(0,122,255,0.8);
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background: rgba(0,122,255,1);
    }
    ul { list-style: none; padding: 0; }
    li {
      margin: 0.25rem 0;
      padding: 0.5rem;
      background: rgba(255,255,255,0.5);
      border-radius: 10px;
    }
    code {
      background: rgba(0,0,0,0.05);
      padding: 0.2rem 0.4rem;
      border-radius: 6px;
    }
  </style>
`;

// Home
app.get('/', (req, res) => {
  res.send(`
    ${glassCSS}
    <div class="glass">
      <h2>Vulnerable Demo</h2>
      <ul>
        <li><a href="/greet?name=guest">Reflected XSS /greet</a></li>
        <li><a href="/guestbook">Stored XSS (guestbook)</a></li>
        <li><a href="/dom">DOM-based XSS demo</a></li>
      </ul>
    </div>
  `);
});

// Reflected XSS
app.get('/greet', (req, res) => {
  const name = req.query.name || 'guest';
  res.send(`
    ${glassCSS}
    <div class="glass">
      <h1>Greeting</h1>
      <p>Welcome: ${name}</p>
      <p>Try adding ?name=... to the URL</p>
      <p><a href="/">Back</a></p>
    </div>
  `);
});

// Stored XSS
app.get('/guestbook', (req, res) => {
  const list = comments.map(c => `<li>${c}</li>`).join('');
  res.send(`
    ${glassCSS}
    <div class="glass">
      <h1>Guestbook</h1>
      <form method="POST" action="/guestbook">
        Name: <input name="name"><br>
        Comment: <textarea name="comment" spellcheck="false"><br>
        <button type="submit">Post</button>
      </form>
      <h2>Entries</h2>
      <ul>${list}</ul>
      <p><a href="/">Back</a></p>
    </div>
  `);
});
app.post('/guestbook', (req, res) => {
  const name = req.body.name || 'anon';
  const comment = req.body.comment || '';
  comments.push(`<strong>${name}</strong>: ${comment}`);
  res.redirect('/guestbook');
});

// DOM-based XSS
app.get('/dom', (req, res) => {
  res.send(`
    ${glassCSS}
    <div class="glass">
      <h1>DOM XSS demo</h1>
      <p>Try visiting with <code>#msg=%3Cscript%3Ealert('DOM XSS')%3C/script%3E</code></p>
      <div id="output">(no message)</div>
      <script>
        // BAD: directly inject decoded hash into innerHTML
        const hash = location.hash.slice(1); // remove '#'
        if (hash.startsWith("msg=")) {
          const msg = decodeURIComponent(hash.substring(4));
          document.getElementById('output').innerHTML = msg;
        }
      </script>
      <p><a href="/">Back</a></p>
    </div>
  `);
});

app.listen(3000, () => console.log('Vuln demo running on http://localhost:3000'));
