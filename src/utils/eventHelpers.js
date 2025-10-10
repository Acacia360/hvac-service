function evaluateCondition(sensor, variable, operator, targetValue) {
  const currentValue = sensor[variable.toLowerCase()];
  if (currentValue === undefined) return false;
  switch (operator) {
    case ">": return currentValue > targetValue;
    case "<": return currentValue < targetValue;
    case ">=": return currentValue >= targetValue;
    case "<=": return currentValue <= targetValue;
    case "==": return currentValue == targetValue;
    case "!=": return currentValue != targetValue;
    default: return false;
  }
}

function isWithinSchedule(scheduleJson) {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();
  try {
    const schedule = JSON.parse(scheduleJson);
    return Array.isArray(schedule[day]) && schedule[day].includes(hour);
  } catch (e) {
    console.error("Invalid week_schedule JSON:", e.message);
    return false;
  }
}

module.exports = {
  evaluateCondition,
  isWithinSchedule,
};