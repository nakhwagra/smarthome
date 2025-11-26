// mock nya dulu

const authApi = {
    login: async (username, password) => {
        if (username === "admin" && password === "admin") {
            return { success: true, token: "dummy-token", username: "admin" };
        }
        return { success: false };
    },
};

export default authApi;