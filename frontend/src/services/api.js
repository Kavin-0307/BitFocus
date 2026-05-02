const API_BASE = "http://localhost:8080/api";

export const getTasks = async () => {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return await response.json();
    } catch (error) {
        console.error("API getTasks error:", error);
        return [];
    }
};

export const createTask = async (taskData) => {
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error("Failed to create task");
        return await response.json();
    } catch (error) {
        console.error("API createTask error:", error);
        throw error;
    }
};

export const deleteTask = async (taskId) => {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete task");
        return true;
    } catch (error) {
        console.error("API deleteTask error:", error);
        throw error;
    }
};

export const simulatePomodoro = async (taskId, completed) => {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/pomodoro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed })
        });
        if (!response.ok) throw new Error("Failed to simulate pomodoro");
        return await response.json();
    } catch (error) {
        console.error("API simulatePomodoro error:", error);
        throw error;
    }
};
