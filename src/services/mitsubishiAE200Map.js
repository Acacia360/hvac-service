const Bacnet = require("bacstack");

module.exports = {
  power: (roomId) => ({
    type: Bacnet.enum.ObjectType.BINARY_VALUE,
    instance: (parseInt(roomId) * 100) + 1
  }),
  mode: (roomId) => ({
    type: Bacnet.enum.ObjectType.MULTI_STATE_VALUE,
    instance: (parseInt(roomId) * 100) + 1
  }),
  temperature: (roomId) => ({
    type: Bacnet.enum.ObjectType.ANALOG_VALUE,
    instance: (parseInt(roomId) * 100) + 1
  }),
  fanSpeed: (roomId) => ({
    type: Bacnet.enum.ObjectType.MULTI_STATE_VALUE,
    instance: (parseInt(roomId) * 100) + 2
  }),
  airDirection: (roomId) => ({
    type: Bacnet.enum.ObjectType.MULTI_STATE_VALUE,
    instance: (parseInt(roomId) * 100) + 3
  })
};