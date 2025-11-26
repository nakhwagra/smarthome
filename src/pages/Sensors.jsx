export default function Sensors() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-3">Sensor Monitoring</h1>

            <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-lg">🔥 Gas Level: Normal</p>
                <p className="text-lg mt-2">🌡️ Temperature: 25°C</p>
                <p className="text-lg mt-2">💧 Humidity: 60%</p>
            </div>
        </div>
    );
}