/**
 * Restaurant Backend Server
 * Built with pure Node.js (No external dependencies required!)
 * Serves static frontend files and provides REST APIs for Menu, Orders & Reservations.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper: Read JSON file safely
function readJsonFile(filename, defaultValue = []) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return defaultValue;
  }
}

// Helper: Write JSON file safely
function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
}

// Helper: Parse Request Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper: Serve Static Files
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for SPA or 404
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // --- API ROUTES ---

  // 1. Get Menu Items
  if (pathname === '/api/menu' && method === 'GET') {
    const menu = readJsonFile('menu.json', []);
    return sendJson(res, 200, { success: true, count: menu.length, data: menu });
  }

  // 2. Get All Orders
  if (pathname === '/api/orders' && method === 'GET') {
    const orders = readJsonFile('orders.json', []);
    return sendJson(res, 200, { success: true, count: orders.length, data: orders });
  }

  // 3. Place New Order
  if (pathname === '/api/orders' && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.items || !body.items.length || !body.customer) {
        return sendJson(res, 400, { success: false, message: 'Invalid order data. Items and customer details are required.' });
      }

      const orders = readJsonFile('orders.json', []);
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        customer: {
          name: body.customer.name || 'Guest',
          phone: body.customer.phone || '',
          address: body.customer.address || '',
          paymentMethod: body.customer.paymentMethod || 'Cash On Delivery'
        },
        items: body.items,
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        deliveryFee: body.deliveryFee || 0,
        total: body.total || 0,
        status: 'Preparing' // 'Received' -> 'Preparing' -> 'Out for Delivery' -> 'Delivered'
      };

      orders.unshift(newOrder); // Add to beginning of array
      writeJsonFile('orders.json', orders);

      return sendJson(res, 201, {
        success: true,
        message: 'Order placed successfully!',
        order: newOrder
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Server error processing order' });
    }
  }

  // 4. Update Order Status
  if (pathname.startsWith('/api/orders/') && method === 'PATCH') {
    try {
      const orderId = pathname.split('/')[3];
      const body = await parseBody(req);
      const orders = readJsonFile('orders.json', []);
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        return sendJson(res, 404, { success: false, message: 'Order not found' });
      }

      if (body.status) {
        orders[orderIndex].status = body.status;
        writeJsonFile('orders.json', orders);
      }

      return sendJson(res, 200, { success: true, order: orders[orderIndex] });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Error updating order' });
    }
  }

  // 5. Get All Reservations
  if (pathname === '/api/reservations' && method === 'GET') {
    const reservations = readJsonFile('reservations.json', []);
    return sendJson(res, 200, { success: true, count: reservations.length, data: reservations });
  }

  // 6. Book Table Reservation
  if (pathname === '/api/reservations' && method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.phone || !body.date || !body.time || !body.guests) {
        return sendJson(res, 400, { success: false, message: 'Missing required reservation fields.' });
      }

      const reservations = readJsonFile('reservations.json', []);
      const newReservation = {
        id: `TBL-${Date.now().toString().slice(-5)}`,
        createdAt: new Date().toISOString(),
        name: body.name,
        phone: body.phone,
        email: body.email || '',
        date: body.date,
        time: body.time,
        guests: Number(body.guests),
        seatingType: body.seatingType || 'Indoor Dining',
        specialRequest: body.specialRequest || 'None',
        status: 'Confirmed'
      };

      reservations.unshift(newReservation);
      writeJsonFile('reservations.json', reservations);

      return sendJson(res, 201, {
        success: true,
        message: 'Table reserved successfully! Your booking is confirmed.',
        reservation: newReservation
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Server error booking table' });
    }
  }

  // 7. Contact Us Form
  if (pathname === '/api/contact' && method === 'POST') {
    try {
      const body = await parseBody(req);
      return sendJson(res, 200, {
        success: true,
        message: `Thank you ${body.name || 'Customer'}! We have received your message.`
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: 'Error saving message' });
    }
  }

  // --- SERVE STATIC FRONTEND FILES ---
  serveStaticFile(req, res, pathname);
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍽️  Restaurant Website Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📦 Node.js Backend Ready with REST APIs & Data Storage`);
  console.log(`====================================================`);
});
