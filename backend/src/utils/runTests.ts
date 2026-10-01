/**
 * Automated End-to-End & Integration Test Suite for Business Link Hub
 */
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 Starting Automated Test Suite for Link Hub');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, detail || '');
      failed++;
    }
  };

  try {
    // Test 1: Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'healthy', 'API Health Check returns healthy');

    // Test 2: Public Business fetch
    const publicRes = await fetch(`${BASE_URL}/api/public/business/onebite-bakery`);
    const publicData = await publicRes.json();
    assert(publicData.success === true, 'Public Business API returns success: true');
    assert(publicData.business.name === 'OneBite Bakery', 'Business name is OneBite Bakery');
    assert(publicData.business.slug === 'onebite-bakery', 'Business slug is onebite-bakery');
    assert(Array.isArray(publicData.links) && publicData.links.length > 0, 'Public links array is populated');
    assert(publicData.openStatus !== null, 'Open/Closed status is calculated automatically');
    assert(typeof publicData.openStatus.isOpen === 'boolean', 'OpenStatus.isOpen is boolean');
    assert(publicData.appearance !== null, 'Appearance configuration is returned');

    // Test 3: Track page view
    const viewRes = await fetch(`${BASE_URL}/api/public/business/onebite-bakery/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: 'https://test.runner' }),
    });
    const viewData = await viewRes.json();
    assert(viewData.success === true, 'Page view tracking records without error');

    // Test 4: Track link click
    const firstLinkId = publicData.links[0].id;
    const clickRes = await fetch(`${BASE_URL}/api/public/business/onebite-bakery/links/${firstLinkId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: 'Direct' }),
    });
    const clickData = await clickRes.json();
    assert(clickData.success === true, 'Link click tracking increments successfully');

    // Test 5: QR Code generation
    const qrRes = await fetch(`${BASE_URL}/api/public/business/onebite-bakery/qr`);
    const qrData = await qrRes.json();
    assert(qrData.success === true && qrData.qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code PNG Data URL generated');

    const qrSvgRes = await fetch(`${BASE_URL}/api/public/business/onebite-bakery/qr?format=svg`);
    const qrSvgText = await qrSvgRes.text();
    assert(qrSvgText.includes('<svg'), 'QR Code Vector SVG generated');

    // Test 6: User-Requested PIN Login with 753753
    const pinRes = await fetch(`${BASE_URL}/api/auth/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '753753' }),
    });
    const pinData = await pinRes.json();
    assert(pinData.success === true && !!pinData.token, 'PIN 753753 authentication grants valid JWT token');
    const adminToken = pinData.token;

    // Test 7: Standard Email & Password Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@businesslinkhub.local',
        password: 'admin123456',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginData.success === true && !!loginData.token, 'Email + password login succeeds');

    // Test 8: Protected Route rejects without token
    const unauthRes = await fetch(`${BASE_URL}/api/admin/links`);
    assert(unauthRes.status === 401, 'Protected admin route rejects unauthorized access (HTTP 401)');

    // Test 9: Protected Route succeeds with token
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    const linksRes = await fetch(`${BASE_URL}/api/admin/links`, { headers: authHeaders });
    const linksData = await linksRes.json();
    assert(linksData.success === true && Array.isArray(linksData.links), 'Admin can fetch full link list with token');

    // Test 10: Create new link via Admin API
    const newLinkRes = await fetch(`${BASE_URL}/api/admin/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'TEST ARTISAN SOURDOUGH SPECIAL',
        description: 'Automated test link description',
        type: 'product',
        url: 'https://onebitebakery.com/sourdough-test',
        icon: 'Cake',
        isActive: true,
        isFeatured: true,
        customBadge: 'Automated Test',
      }),
    });
    const newLinkData = await newLinkRes.json();
    assert(newLinkData.success === true && newLinkData.link.title === 'TEST ARTISAN SOURDOUGH SPECIAL', 'Admin can create a new link');
    const createdLinkId = newLinkData.link._id;

    // Test 11: Toggle link active status
    const toggleRes = await fetch(`${BASE_URL}/api/admin/links/${createdLinkId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    const toggleData = await toggleRes.json();
    assert(toggleData.success === true && toggleData.link.isActive === false, 'Admin can toggle link active status to false');

    // Test 12: Duplicate link
    const dupRes = await fetch(`${BASE_URL}/api/admin/links/${createdLinkId}/duplicate`, {
      method: 'POST',
      headers: authHeaders,
    });
    const dupData = await dupRes.json();
    assert(dupData.success === true && dupData.link.title.includes('(Copy)'), 'Admin can duplicate existing link');

    // Clean up duplicated link
    await fetch(`${BASE_URL}/api/admin/links/${dupData.link._id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    // Test 13: Delete test link
    const delRes = await fetch(`${BASE_URL}/api/admin/links/${createdLinkId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const delData = await delRes.json();
    assert(delData.success === true, 'Admin can delete link permanently');

    // Test 14: Analytics Summary
    const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics?days=30`, { headers: authHeaders });
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.success === true && typeof analyticsData.stats.totalViews === 'number', 'Admin analytics reports views, clicks, and CTR');

    console.log('\n==================================================');
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
