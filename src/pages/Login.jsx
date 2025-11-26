export default function Login() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow w-80">
                <h1 className="text-xl font-bold mb-4 text-center">Login Smart Home</h1>

                <input
                    className="w-full p-2 mb-3 border rounded"
                    type="text"
                    placeholder="Username"
                />
                <input
                    className="w-full p-2 mb-3 border rounded"
                    type="password"
                    placeholder="Password"
                />

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg">
                    Login
                </button>
            </div>
        </div>
    );
}