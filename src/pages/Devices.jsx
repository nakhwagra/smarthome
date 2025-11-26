export default function Devices() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-3">Devices Control</h1>

            <div className="bg-white p-4 rounded-xl shadow">
                <p className="text-lg">Lampu Ruang Tamu: <b>OFF</b></p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Toggle Lamp
                </button>
            </div>
        </div>
    );
}