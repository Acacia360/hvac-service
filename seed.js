const db = require("./src/models");

const hvacs = [
    {
        hvac_id: "ACWCXYZ1234",
        hvac_name: "HVAC Unit 1",
        hvac_brand: "Mitsubishi Electric",
        hvac_model: "AE-200",
        hvac_type: "mitsubishiElectric",
        hvac_serial_number: "AE-01234567",
        hvac_manufacture_date: "2020-05-15",
        hvac_installation_date: "2021-03-01",
        hvac_installation_location: "Floor 5",
        hvac_property_id: "PROPHOT0001",
        hvac_room_ids: [1,2,3,4,5,6],
        hvac_connectivity: "Ethernet",
        hvac_control_method: "",
        hvac_status: true,
        hvac_operation_mode: "Auto",
        hvac_temperature: 22.5,
        hvac_fan_status: true,
        hvac_fan_speed: "2",
        hvac_lossnay_fan_speed: "Auto",
        hvac_air_direction: "Auto",
        hvac_ventillation_mode: "Fresh Air",
        hvac_power_source: "Mains AC",
        hvac_energy_consumption_data: {},
        hvac_schedule_status: false,
        hvac_schedule_settings: {},
        hvac_notification_settings: {},
        hvac_maintenance_logs: "",
        hvac_last_maintenance_date: "2024-03-10",
        hvac_warranty_expiration: "2026-03-01",
        hvac_notes: "Main unit for public areas. High priority maintenance."
    },
    {
        hvac_id: "ACWCABC5678",
        hvac_name: "HVAC Unit 2",
        hvac_brand: "Mitsubishi Electric",
        hvac_model: "AE-50",
        hvac_type: "mitsubishiElectric",
        hvac_serial_number: "AE-98765432",
        hvac_manufacture_date: "2022-11-20",
        hvac_installation_date: "2023-01-15",
        hvac_installation_location: "Plant Room",
        hvac_property_id: "PROPHOT0001",
        hvac_room_ids: [1,2,3,4,5,6],
        hvac_connectivity: "Wi-Fi",
        hvac_control_method: "",
        hvac_status: true,
        hvac_operation_mode: "Cooling",
        hvac_temperature: 20.0,
        hvac_fan_status: true,
        hvac_fan_speed: "1",
        hvac_lossnay_fan_speed: "1",
        hvac_air_direction: "Swing",
        hvac_ventillation_mode: "Recirculation",
        hvac_power_source: "Mains AC",
        hvac_energy_consumption_data: {},
        hvac_schedule_status: false,
        hvac_schedule_settings: {},
        hvac_notification_settings: {},
        hvac_maintenance_logs: "",
        hvac_last_maintenance_date: "2023-01-15",
        hvac_warranty_expiration: "2028-01-15",
        hvac_notes: "Standard unit."
    }
];

async function seedDatabase() {
    try {
        await db.sequelize.sync({ alter: true }); 
        console.log("Database synchronized.");
        
        const hvacCount = await db.HVAC.count();
        if (hvacCount === 0) {
            await db.HVAC.bulkCreate(hvacs);
            console.log("HVAC data seeded successfully!");
        } else {
            console.log("HVAC table is not empty. Skipping seeding.");
        }
    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        await db.sequelize.close(); 
    }
}

seedDatabase();