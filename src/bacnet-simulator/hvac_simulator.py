from bacpypes.app import BIPSimpleApplication
from bacpypes.local.device import LocalDeviceObject
from bacpypes.object import (
    AnalogValueObject, 
    BinaryValueObject, 
    MultiStateValueObject
)
from bacpypes.core import run
from bacpypes.task import RecurringTask

device = LocalDeviceObject(
    objectName="HVAC-MultiRoom-Simulator",
    objectIdentifier=12345,
    maxApduLengthAccepted=480,
    segmentationSupported="noSegmentation",
    vendorIdentifier=15,
)

hvac_data = [
    {"room_id": 1, "status": "active", "mode": 1, "temp": 18.0, "fan": 4, "dir": 3},
    {"room_id": 2, "status": "active", "mode": 2, "temp": 22.0, "fan": 3, "dir": 2},
    {"room_id": 3, "status": "active", "mode": 3, "temp": 25.5, "fan": 2, "dir": 1},
    {"room_id": 4, "status": "active", "mode": 4, "temp": 26.5, "fan": 1, "dir": 2},
    {"room_id": 5, "status": "active", "mode": 1, "temp": 30.0, "fan": 4, "dir": 5},
]

all_objects = []

for room in hvac_data:
    rid = room["room_id"]
    base = rid * 100
    
    pwr = BinaryValueObject(objectIdentifier=("binaryValue", base + 1), objectName=f"room_{rid}_power", presentValue=room["status"])
    mode = MultiStateValueObject(objectIdentifier=("multiStateValue", base + 1), objectName=f"room_{rid}_mode", numberOfStates=4, presentValue=room["mode"])
    temp = AnalogValueObject(objectIdentifier=("analogValue", base + 1), objectName=f"room_{rid}_temp", presentValue=room["temp"], units="degreesCelsius")
    fan = MultiStateValueObject(objectIdentifier=("multiStateValue", base + 2), objectName=f"room_{rid}_fan", numberOfStates=4, presentValue=room["fan"])
    direction = MultiStateValueObject(objectIdentifier=("multiStateValue", base + 3), objectName=f"room_{rid}_direction", numberOfStates=5, presentValue=room["dir"])

    room_objs = [pwr, mode, temp, fan, direction]
    for obj in room_objs:
        for prop in obj._properties.values():
            if prop.identifier == 'presentValue': prop.mutable = True
    
    all_objects.extend(room_objs)

class MonitorTask(RecurringTask):
    def __init__(self, interval):
        super().__init__(interval * 1000)
        self.mode_map = {1: "Heat", 2: "Cool", 3: "Dry", 4: "Fan"}
        self.fan_map = {1: "Auto", 2: "Low", 3: "Med", 4: "High"}
        self.dir_map = {1: "Auto", 2: "Swing", 3: "Left", 4: "Center", 5: "Right"}

    def process_task(self):
        rooms = {}
        for obj in all_objects:
            rid = int(obj.objectName.split('_')[1])
            if rid not in rooms: rooms[rid] = {}
            
            val = obj.presentValue
            if "power" in obj.objectName: rooms[rid]["pwr"] = "ON" if val == "active" else "OFF"
            elif "mode" in obj.objectName: rooms[rid]["mode"] = self.mode_map.get(val, "Unknown")
            elif "temp" in obj.objectName: rooms[rid]["temp"] = val
            elif "fan" in obj.objectName: rooms[rid]["fan"] = self.fan_map.get(val, "Unknown")
            elif "direction" in obj.objectName: rooms[rid]["dir"] = self.dir_map.get(val, "Unknown")

        print("\n" + "="*85)
        print(f"{'ROOM ID':<8}    | {'POWER':<6} | {'MODE':<8} | {'TEMP':<8} | {'FAN SPEED':<10} | {'DIRECTION':<10}")
        print("-" * 85)

        for rid in sorted(rooms.keys()):
            r = rooms[rid]
            print(f"Room ID {rid:<3} | {r['pwr']:<6} | {r['mode']:<8} | {r['temp']:>4.1f}°C   | {r['fan']:<10} | {r['dir']:<10}")
        print("="*85)

app = BIPSimpleApplication(device, "0.0.0.0")
for obj in all_objects:
    app.add_object(obj)

task = MonitorTask(5)
task.install_task()

print(f"Simulator Online: 5 Rooms")
run()