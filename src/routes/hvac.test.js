const request = require('supertest');
const app = require('../app');
const db = require('../models');

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

    // NOTE: This will fail with 400 if you don't fix the req.params.hvac_id vs req.params.id bug in your controller!
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("HVAC updated successfully");
    expect(res.body.data.hvac_temperature).toBe(24.0);
    expect(res.body.data.hvac_name).toBe("Updated Lobby AC Unit");
  });

  it('5. DELETE /api/hvac/:id - should delete the HVAC unit', async () => {
    const res = await request(app).delete(`/api/hvac/${createdHvacId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("HVAC deleted");

    // Verify it was actually deleted
    const checkRes = await request(app).get(`/api/hvac/${createdHvacId}`);
    expect(checkRes.status).toBe(404);
  });
});