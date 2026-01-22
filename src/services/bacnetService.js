const Bacnet = require("bacstack");

const client = new Bacnet({
  port: 47808,
  apduTimeout: 10000
});

function readProperty({ ip, type, instance }) {
  return new Promise((resolve, reject) => {
    client.readProperty(
      ip,
      { type, instance },
      Bacnet.enum.PropertyIdentifier.PRESENT_VALUE,
      (err, value) => {
        if (err) return reject(err);
        resolve(value.values[0].value);
      }
    );
  });
}

function writeProperty({ ip, type, instance, value }) {
  let tag;

  if (type === Bacnet.enum.ObjectType.MULTI_STATE_VALUE) {
    tag = Bacnet.enum.ApplicationTags.UNSIGNED_INTEGER;
    value = parseInt(value, 10);
  } 
  else if (type === Bacnet.enum.ObjectType.BINARY_VALUE) {
    tag = Bacnet.enum.ApplicationTags.ENUMERATED;
    value = parseInt(value, 10);
  } 
  else if (type === Bacnet.enum.ObjectType.ANALOG_VALUE) {
    tag = Bacnet.enum.ApplicationTags.REAL;
    value = parseFloat(value);
  }

  console.log(`[BACnet] Writing to ${ip} -> Object ${type}:${instance} with value ${value} (Tag: ${tag})`);

  return new Promise((resolve, reject) => {
    client.writeProperty(
      ip,
      { type, instance },
      Bacnet.enum.PropertyIdentifier.PRESENT_VALUE,
      [{ type: tag, value: value }],
      { 
        priority: 16
      },
      (err) => (err ? reject(err) : resolve(true))
    );
  });
}

module.exports = {
  readProperty,
  writeProperty,
};