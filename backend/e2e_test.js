const http = require('http');

// const baseURL = 'http://localhost:4000/api';
let token = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
          } else {
            resolve({ error: true, status: res.statusCode, data });
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- E2E Tests ---');

  // 1. Generate Token
  console.log('\n1. Generating token...');
  const jwt = require('jsonwebtoken');
  const testUserId = '22222222-2222-2222-2222-222222222222';
  token = jwt.sign({ sub: testUserId }, 'dev-only-jwt-secret-change-in-production-32chars', {
    expiresIn: '1h',
  });
  console.log('Token generated.');

  // 2. Management (Parent)
  console.log('\n2. Testing Management - Parent...');
  const parentRes = await request('POST', '/management/parents', {
    name: 'E2E Parent',
    email: 'parent@e2e.com',
    phone: '1234567890',
  });
  console.log('Parent creation:', parentRes);
  const parentId = parentRes.parent?.id;

  // 3. Management (Classroom)
  console.log('\n3. Testing Management - Classroom...');
  const classRes = await request('POST', '/management/classrooms', {
    name: 'E2E Classroom',
    capacity: 20,
  });
  console.log('Classroom creation:', classRes);
  const classId = classRes.classroom?.id;

  // 4. Management (Child)
  console.log('\n4. Testing Management - Child...');
  const childRes = await request('POST', '/management/children', {
    name: 'E2E Child',
    dob: '2020-01-01',
    parent_id: parentId,
    classroom_id: classId,
    medical_info: 'None',
  });
  console.log('Child creation:', childRes);

  // 5. Communications
  console.log('\n5. Testing Communications...');
  const commRes = await request('POST', '/communications/send', {
    parentId: parentId,
    type: 'whatsapp',
    message: 'Hello from E2E!',
  });
  console.log('Communication:', commRes);

  // 6. Curriculum Planner
  console.log('\n6. Testing Curriculum Planner...');
  const curRes = await request('POST', '/curriculum', {
    theme: 'Space',
    week_number: 1,
    details: 'Explore stars',
  });
  console.log('Curriculum mapping:', curRes);

  const curList = await request('GET', '/curriculum');
  console.log('Curriculum list count:', curList.length);

  // 7. Materials Checklist
  console.log('\n7. Testing Materials Checklist...');
  const matRes = await request('GET', '/materials/requirements?theme=Space');
  console.log('Materials (Space):', matRes);

  // 8. Generate Lesson (Mocking this might take time, let's just insert one or use the mock API)
  console.log('\n8. Generating Lesson Plan...');
  // Assuming /lessons/generate is quick because of the mock
  const lessonRes = await request('POST', '/lessons/generate', {
    theme: 'Space',
    ageGroup: '4-5',
  });
  console.log('Lesson generated:', lessonRes.id ? 'Success' : lessonRes);
  const lessonId = lessonRes.id;

  // 9. Approve Lesson
  if (lessonId) {
    console.log('\n9. Approving Lesson...');
    const appRes = await request('POST', `/lessons/${lessonId}/approve`);
    console.log('Approve result:', appRes);

    // 10. Export CSV
    console.log('\n10. Exporting CSV...');
    const csvRes = await request('GET', `/export/csv/${lessonId}`);
    // Since CSV is not JSON, the request function will return it as a string
    console.log('CSV Export length:', typeof csvRes === 'string' ? csvRes.length : csvRes);
  }

  console.log('\n--- Tests Complete ---');
}

runTests().catch(console.error);
