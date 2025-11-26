export default function History() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-3">History Log</h1>

            <div className="bg-white p-4 rounded-xl shadow">
                <ul className="list-disc list-inside">
                    <li>Sensor Gas Normal - 10:32</li>
                    <li>Lampu Ruang Tamu ON - 10:05</li>
                    <li>Lampu Dapur OFF - 09:55</li>
                </ul>
            </div>
        </div>
    );
}