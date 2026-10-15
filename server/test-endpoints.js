const http = require('http');

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Accept': 'application/json',
        ...(data ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(raw);
        } catch (e) {
          json = raw;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

function assert(condition, message) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

function assertShape(obj, label) {
  const keys = Object.keys(obj).sort();
  const expectedKeys = ['author', 'createdAt', 'id', 'status', 'title'];
  assert(
    JSON.stringify(keys) === JSON.stringify(expectedKeys),
    `${label} exact keys match ['author', 'createdAt', 'id', 'status', 'title']. Got: ${JSON.stringify(keys)}`
  );
  assert(typeof obj.id === 'string' && obj.id.length > 0, `${label} id is non-empty string`);
  assert(obj._id === undefined, `${label} does NOT contain _id`);
  assert(obj.__v === undefined, `${label} does NOT contain __v`);
}

async function runTests() {
  console.log('=== RUNNING BACKEND TESTS ===\n');

  // 1. Initial GET
  const getInitial = await request('GET', '/books');
  assert(getInitial.status === 200, `GET /books returns 200 (Got ${getInitial.status})`);
  assert(Array.isArray(getInitial.data), 'GET /books returns an array');

  // 2. POST Validation: Missing / Empty / Whitespace Title
  const emptyTitle = await request('POST', '/books', { title: '', author: 'Jane Doe' });
  assert(emptyTitle.status === 400 && emptyTitle.data.error === 'Title is required', 'POST empty title rejected with 400 "Title is required"');

  const whitespaceTitle = await request('POST', '/books', { title: '   ', author: 'Jane Doe' });
  assert(whitespaceTitle.status === 400 && whitespaceTitle.data.error === 'Title is required', 'POST whitespace title rejected with 400 "Title is required"');

  const missingTitle = await request('POST', '/books', { author: 'Jane Doe' });
  assert(missingTitle.status === 400 && missingTitle.data.error === 'Title is required', 'POST missing title rejected with 400 "Title is required"');

  // 3. POST Validation: Missing / Empty / Whitespace Author
  const emptyAuthor = await request('POST', '/books', { title: 'Book Title', author: '' });
  assert(emptyAuthor.status === 400 && emptyAuthor.data.error === 'Author is required', 'POST empty author rejected with 400 "Author is required"');

  const whitespaceAuthor = await request('POST', '/books', { title: 'Book Title', author: '   ' });
  assert(whitespaceAuthor.status === 400 && whitespaceAuthor.data.error === 'Author is required', 'POST whitespace author rejected with 400 "Author is required"');

  const missingAuthor = await request('POST', '/books', { title: 'Book Title' });
  assert(missingAuthor.status === 400 && missingAuthor.data.error === 'Author is required', 'POST missing author rejected with 400 "Author is required"');

  // 4. POST Valid Book 1
  const create1 = await request('POST', '/books', { title: 'Clean Code', author: 'Robert C. Martin' });
  assert(create1.status === 201, `POST /books returns 201 (Got ${create1.status})`);
  assertShape(create1.data, 'Created Book 1');
  assert(create1.data.status === 'unread', 'Default status is "unread"');
  assert(create1.data.title === 'Clean Code', 'Title matches');
  assert(create1.data.author === 'Robert C. Martin', 'Author matches');
  const book1Id = create1.data.id;

  // Short delay so createdAt timestamps differ
  await new Promise(r => setTimeout(r, 20));

  // 5. POST Valid Book 2
  const create2 = await request('POST', '/books', { title: '  The Pragmatic Programmer  ', author: '  Andrew Hunt  ' });
  assert(create2.status === 201, `POST /books returns 201 (Got ${create2.status})`);
  assertShape(create2.data, 'Created Book 2');
  assert(create2.data.title === 'The Pragmatic Programmer', 'Title was trimmed');
  assert(create2.data.author === 'Andrew Hunt', 'Author was trimmed');
  const book2Id = create2.data.id;

  // 6. GET /books (verify ordering and shape)
  const getAll = await request('GET', '/books');
  assert(getAll.status === 200, 'GET /books returns 200');
  assert(getAll.data.length >= 2, `GET /books returned at least 2 books (Got ${getAll.data.length})`);
  assertShape(getAll.data[0], 'GET list item 0');
  assertShape(getAll.data[1], 'GET list item 1');
  assert(getAll.data[0].id === book2Id, 'Newest book is first in list');

  // 7. PUT /books/:id with Invalid ObjectId
  const putInvalidId = await request('PUT', '/books/invalid-id-123', {});
  assert(putInvalidId.status === 400 && putInvalidId.data.error === 'Invalid book id', 'PUT invalid ObjectId rejected with 400 "Invalid book id"');

  // 8. PUT /books/:id with Nonexistent ObjectId
  const putNonexistent = await request('PUT', '/books/507f1f77bcf86cd799439011', {});
  assert(putNonexistent.status === 404 && putNonexistent.data.error === 'Book not found', 'PUT nonexistent id returns 404 "Book not found"');

  // 9. PUT /books/:id to mark as read
  const putValid = await request('PUT', `/books/${book1Id}`, {});
  assert(putValid.status === 200, `PUT /books/:id returns 200 (Got ${putValid.status})`);
  assertShape(putValid.data, 'Marked Read Book 1');
  assert(putValid.data.status === 'read', 'Status successfully updated to "read"');

  // 10. DELETE /books/:id with Invalid ObjectId
  const delInvalidId = await request('DELETE', '/books/not-valid-id');
  assert(delInvalidId.status === 400 && delInvalidId.data.error === 'Invalid book id', 'DELETE invalid ObjectId rejected with 400 "Invalid book id"');

  // 11. DELETE /books/:id with Nonexistent ObjectId
  const delNonexistent = await request('DELETE', '/books/507f1f77bcf86cd799439011');
  assert(delNonexistent.status === 404 && delNonexistent.data.error === 'Book not found', 'DELETE nonexistent id returns 404 "Book not found"');

  // 12. DELETE /books/:id with valid id
  const delValid = await request('DELETE', `/books/${book2Id}`);
  assert(delValid.status === 200, `DELETE /books/:id returns 200 (Got ${delValid.status})`);
  assert(delValid.data.id === book2Id, 'DELETE response includes deleted id');
  assert(typeof delValid.data.message === 'string', 'DELETE response includes message');

  // 13. Verify deletion
  const verifyDeleted = await request('PUT', `/books/${book2Id}`, {});
  assert(verifyDeleted.status === 404, 'Verified book2 is deleted (PUT returns 404)');

  // 14. 404 Route handling
  const badRoute = await request('GET', '/api/nonexistent');
  assert(badRoute.status === 404 && badRoute.data.error === 'Route not found', 'Unknown route returns 404 { error: "Route not found" }');

  console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===\n');
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});

