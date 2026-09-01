process.env.NODE_ENV = 'test';

const request = require('supertest');
const db = require('../models');

jest.mock('../middleware/authenticate', () => (req, res, next) => {
  req.user = {
    user_id: 1,
    user_email: 'test@acaciagtech.co.uk',
    user_role_name: 'Administrator',
  };
  next();
});

jest.mock('../middleware/validateControlBody', () => (req, res, next) => next());

jest.mock('../middleware/resolveHvacRoom', () => (req, res, next) => {
  req.room = {
    hvac_id: req.params.hvacId,
    hvac_controller_ip: '10.0.0.12',
    hvac_group_id: 1,
    update: jest.fn().mockResolvedValue(true),
  };
  next();
});

jest.mock('../services/deviceRegistry.service', () => ({
  getOrCreateClient: jest.fn(async () => ({
    refreshAll: jest.fn().mockResolvedValue(true),
    getCachedStates: jest.fn(() => ({})),
    controlGroup: jest.fn(async () => ({
      hvac_status: 'OFF',
      hvac_temperature: 19,
      hvac_operation_mode: 'AUTO',
      hvac_fan_speed: 'LOW',
    })),
  })),
  getKnownControllerIps: jest.fn(async () => []),
  disconnectAll: jest.fn(),
}));

jest.mock('../services/hvacSync.service', () => ({
  syncStatesToDb: jest.fn().mockResolvedValue({ updated: [], untracked: [] }),
  stateToHvacFields: jest.fn((state) => ({
    hvac_status: state.hvac_status,
    hvac_temperature: state.hvac_temperature,
    hvac_operation_mode: state.hvac_operation_mode,
    hvac_fan_speed: state.hvac_fan_speed,
  })),
}));

jest.mock('../services/hvacHistory.service', () => ({
  recordAction: jest.fn().mockResolvedValue(true),
}));

const app = require('../app');

describe('HVAC API Endpoints', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('GET /api/health - returns healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.timestamp).toBeTruthy();
  });

  it('GET /api/hvac/:ip - returns 404 when no room records exist for that controller', async () => {
    const res = await request(app).get('/api/hvac/10.0.0.12');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/hvac/:hvacId/control - should accept a valid control request', async () => {
    const res = await request(app)
      .post('/api/hvac/HVAC-TEST-001/control')
      .send({ hvac_status: false, hvac_temperature: 19 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Room HVAC-TEST-001 updated');
  });
});