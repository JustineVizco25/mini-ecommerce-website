import { useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { readStorage, readJsonStorage, writeStorage, removeStorage } from "../utils/storage";

function getStoredUsers() {
    const users = readJsonStorage("users", []);
    return Array.isArray(users)
        ? users.filter((user) => typeof user?.email === "string" && typeof user?.password === "string")
        : [];
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const email = readStorage("currentUserEmail");
        return getStoredUsers().some((user) => user.email === email) ? { email } : null;
    });

    function signUp(email, password) {
        email = email.trim().toLowerCase();
        const users = getStoredUsers();

        if(users.some(u => u.email.trim().toLowerCase() === email)) {
            return { success: false, error: "Email already exists"};
        }
        const newUser = { email, password };
        users.push(newUser);
        if (!writeStorage("users", JSON.stringify(users)) || !writeStorage("currentUserEmail", email)) {
            return { success: false, error: "Browser storage is unavailable. Enable it to use demo accounts, then try logging in or signing up again." };
        }
        setUser( { email })
        return { success : true };
    }

    function login(email, password) {
        email = email.trim().toLowerCase();
        const users = getStoredUsers();
        const user = users.find((u) => u.email.trim().toLowerCase() === email && u.password === password);
        
        if (!user) {
            return {success : false, error: "Invalid email or password"};
        }

        if (!writeStorage("currentUserEmail", user.email)) {
            return { success: false, error: "Browser storage is unavailable. Enable it to use demo accounts." };
        }
        setUser({ email: user.email });

        return { success : true };
    }

    function logout() {
        removeStorage("currentUserEmail");
        setUser(null);
    }
     
      return (
            <AuthContext.Provider value = {{ signUp, user, logout, login }}>
                { children }
            </AuthContext.Provider>
      )
}
