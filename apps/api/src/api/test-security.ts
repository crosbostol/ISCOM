
import http from 'http';

const testRequest = (path: string, headers: any = {}) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
};

async function runTests() {
    console.log('--- Starting Security Tests ---');

    // Test 1: Health (Should be 200)
    try {
        const healthRes: any = await testRequest('/api/health');
        console.log(`[TEST] GET /api/health -> Status: ${healthRes.statusCode} (Expected: 200)`);
        if (healthRes.statusCode !== 200) console.error('FAILED: Health check should be public');
    } catch (e) { console.error('FAILED: Health connection error', e); }

    // Test 2: OT Table (Should be 401)
    try {
        const otRes: any = await testRequest('/api/ottable');
        console.log(`[TEST] GET /api/ottable (No Headers) -> Status: ${otRes.statusCode} (Expected: 401)`);
        if (otRes.statusCode !== 401) console.error('FAILED: /api/ottable should be protected');
    } catch (e) { console.error('FAILED: OT Table connection error', e); }

    // Test 3: Profile (Should be 401)
    try {
        const profileRes: any = await testRequest('/api/auth/profile');
        console.log(`[TEST] GET /api/auth/profile (No Headers) -> Status: ${profileRes.statusCode} (Expected: 401)`);
        if (profileRes.statusCode !== 401) console.error('FAILED: /api/auth/profile should be protected');
    } catch (e) { console.error('FAILED: Profile connection error', e); }

    console.log('--- Tests Finished ---');
}

runTests();
