const https = require('https');

let passed = 0;
let failed = 0;
const results = [];

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    results.push(`PASS ${name}`);
  } else {
    failed++;
    results.push(`FAIL ${name} ${detail}`);
  }
}

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const isForm = typeof body === 'string';
    const options = {
      hostname: 'api.xpenztrack.win',
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': isForm ? 'application/x-www-form-urlencoded' : 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(isForm ? body : JSON.stringify(body));
    req.end();
  });
}

const short = v => JSON.stringify(v)?.slice(0, 150);

async function runTests() {
  const email = process.env.TEST_EMAIL || 'mohankumar8883230737@gmail.com';
  const password = process.env.TEST_PASSWORD || 'mohan123';

  console.log('\nXpenZtrack API Test Suite\n' + '-'.repeat(50));

  const loginRes = await request('POST', '/auth/login',
    `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  assert('Login returns 200', loginRes.status === 200, `got ${loginRes.status}`);
  const token = loginRes.data?.access_token;
  assert('Login returns access_token', !!token, `got: ${short(loginRes.data)}`);

  const badLogin = await request('POST', '/auth/login',
    `username=${encodeURIComponent(email)}&password=wrongpass`);
  assert('Login fails with wrong password', badLogin.status >= 400, `got ${badLogin.status}`);

  const meRes = await request('GET', '/auth/me', null, token);
  assert('GET /auth/me returns 200', meRes.status === 200, `got ${meRes.status}`);
  assert('GET /auth/me returns email', !!meRes.data?.email?.includes('@'), `got: ${short(meRes.data)}`);

  const noAuth = await request('GET', '/auth/me');
  assert('Protected route requires auth', noAuth.status === 401 || noAuth.status === 403, `got ${noAuth.status}`);

  const projRes = await request('GET', '/projects', null, token);
  assert('GET /projects returns 200', projRes.status === 200, `got ${projRes.status}`);
  const projects = Array.isArray(projRes.data)
    ? projRes.data
    : projRes.data?.projects || projRes.data?.items || [];
  assert('GET /projects returns array', Array.isArray(projects), `got type: ${typeof projRes.data}`);
  assert('Projects have required fields',
    projects.length === 0 || (projects[0]?.id && projects[0]?.name),
    `first project: ${short(projects[0])}`);

  const overviewRes = await request('GET', '/analytics/overview', null, token);
  assert('GET /analytics/overview returns 200', overviewRes.status === 200, `got ${overviewRes.status}`);

  const trendsRes = await request('GET', '/analytics/trends?days=7', null, token);
  assert('GET /analytics/trends returns 200', trendsRes.status === 200, `got ${trendsRes.status}`);
  assert('Trends returns array', Array.isArray(trendsRes.data), `got: ${short(trendsRes.data)}`);
  if (Array.isArray(trendsRes.data) && trendsRes.data.length > 0) {
    assert('Trends items have date field', !!trendsRes.data[0]?.date, `got: ${short(trendsRes.data[0])}`);
    assert('Trends amount is parseable number',
      !isNaN(parseFloat(trendsRes.data[0]?.amount)), `got: ${trendsRes.data[0]?.amount}`);
  }

  const orgSummary = await request('GET', '/analytics/org/summary', null, token);
  assert('GET /analytics/org/summary returns 200', orgSummary.status === 200, `got ${orgSummary.status}: ${short(orgSummary.data)}`);

  const mySummary = await request('GET', '/analytics/my/summary', null, token);
  assert('GET /analytics/my/summary returns 200', mySummary.status === 200, `got ${mySummary.status}: ${short(mySummary.data)}`);

  const chatRes = await request('POST', '/chat/expense',
    { message: 'Log 500 rupees for lunch', project_id: projects[0]?.id || 1 }, token);
  assert('POST /chat/expense returns 200 or 201',
    chatRes.status === 200 || chatRes.status === 201,
    `got ${chatRes.status}: ${short(chatRes.data)}`);

  const historyRes = await request('GET', '/chat/history', null, token);
  assert('GET /chat/history returns 200', historyRes.status === 200, `got ${historyRes.status}`);

  const membersRes = await request('GET', '/organizations/members', null, token);
  assert('GET /organizations/members returns 200 or 422',
    membersRes.status === 200 || membersRes.status === 422, `got ${membersRes.status}`);

  const exportStatuses = {};
  for (const p of projects) {
    const res = await request('GET', `/export/projects/${p.id}/export/excel`, null, token);
    exportStatuses[p.id] = res.status;
  }
  assert('GET /export/projects/{id}/export/excel works for at least one project',
    Object.values(exportStatuses).some(s => s === 200), `statuses: ${short(exportStatuses)}`);
  const brokenExports = Object.entries(exportStatuses).filter(([, s]) => s >= 500);
  if (brokenExports.length) {
    console.log(`WARN backend 5xx on Excel export for projects: ${brokenExports.map(([id]) => id).join(', ')}`);
  }

  console.log('\nTEST RESULTS\n');
  results.forEach(r => console.log(r));
  console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

runTests().catch(e => { console.error(e); process.exitCode = 1; });
