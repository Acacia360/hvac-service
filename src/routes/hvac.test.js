// 1. Set the test environment
process.env.NODE_ENV = 'test';

const request = require('supertest');
const db = require('../models');

// 2. Mock Middlewares (Must be done BEFORE requiring the app)

// Mock Authenticate to provide a dummy user (prevents apiLogger or other global middlewares from crashing)
jest.mock('../middlewares/authenticate', () => {
  return (req, res, next) => {
    req.user = { 
      user_id: 1, 
      user_email: 'admin@test.com', 
      user_role_name: 'Administrator' 
    }; 
    next();
  };
});

// Mock Authorize to automatically let the test pass through the protected routes
jest.mock('../middlewares/authorize', () => {
  return () => (req, res, next) => next(); 
});

// 3. Require app AFTER the mocks are defined
const app = require('../app');

describe('HVAC API Endpoints (/api/hvac)', () => {
  let createdHvacId;

  beforeAll(async () => {
    // force: true drops the tables and recreates them, ensuring a clean slate for tests
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close the database connection to allow Jest to exit gracefully
    await db.sequelize.close();
  });

  it('1. POST /api/hvac - should create a new HVAC unit', async () => {
    const newHVAC = {
      hvac_name: "Lobby AC Unit",
      hvac_brand: "Mitsubishi",
      hvac_model: "City Multi",
      hvac_type: "VRF",
      hvac_serial_number: "SN-HVAC-001",
      hvac_status: true,
      hvac_temperature: 22.5
    };

    const res = await request(app)
      .post('/api/hvac')
      .send(newHVAC);

    if (res.status !== 201) console.error("CREATE ERROR:", res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("HVAC created successfully");
    expect(res.body.data).toHaveProperty('hvac_id');
    expect(res.body.data.hvac_name).toBe("Lobby AC Unit");

    // Save the dynamically generated HVAC... ID for the next tests
    createdHvacId = res.body.data.hvac_id;
  });

  it('2. GET /api/hvac - should fetch all HVAC units', async () => {
    const res = await request(app).get('/api/hvac');
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("HVACs retrieved and synced successfully");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].hvac_id).toBe(createdHvacId);
  });

  it('3. GET /api/hvac/:id - should fetch a specific HVAC unit', async () => {
    const res = await request(app).get(`/api/hvac/${createdHvacId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.hvac_id).toBe(createdHvacId);
    expect(res.body.hvac_name).toBe("Lobby AC Unit");
  });

  it('4. PUT /api/hvac/:id - should update the HVAC unit', async () => {
    const res = await request(app)
      .put(`/api/hvac/${createdHvacId}`)
      .send({ hvac_temperature: 24.0, hvac_name: "Updated Lobby AC Unit" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("HVAC updated successfully");
    expect(res.body.data.hvac_temperature).toBe(24.0);
    expect(res.body.data.hvac_name).toBe("Updated Lobby AC Unit");
  });

  it('5. POST /api/hvac/:id/control - should send a control command to the HVAC unit', async () => {
    const res = await request(app)
      .post(`/api/hvac/${createdHvacId}/control`)
      .send({ command: "turn_off", hvac_status: false });

    // Note: Adjust the expected status code and body based on what your actual controller returns
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined(); 
  });

  it('6. DELETE /api/hvac/:id - should delete the HVAC unit', async () => {
    const res = await request(app).delete(`/api/hvac/${createdHvacId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("HVAC deleted");

    // Verify it was actually deleted
    const checkRes = await request(app).get(`/api/hvac/${createdHvacId}`);
    
    // Accept 404, 400, or 500 depending on how the controller handles "Not Found"
    expect([404, 400, 500]).toContain(checkRes.status);
  });
});