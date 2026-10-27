import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContextValue";
import { useLocation, useNavigate } from "react-router-dom";

export default function Auth() {
    const location = useLocation();
    const mode = location.state?.mode === "login" ? "login" : "signup";
    const [error, setError] = useState(null);
    const { signUp, login } = useAuth();
    
    const navigate = useNavigate();

    const { register, handleSubmit, clearErrors, formState: { errors }, } = useForm();

    function switchMode(nextMode) {
        setError(null);
        clearErrors();
        navigate("/auth", { replace: true, state: { ...location.state, mode: nextMode } });
    }

    function onSubmit (data) {
        setError(null);
        let result;
        if (mode === "signup") {
            result = signUp(data.email, data.password);
        }

        else {
            result = login(data.email, data.password);
        }
        
        if (result.success) {
            navigate(location.state?.from || "/", { replace: true })
        } else {
            setError(result.error);
        }
 
    }
    return (
        <div className = "page">
            <div className = "container">
                <div className = "auth-container">
                    <h1 className = "page-title">
                        {mode === "signup" ? "Sign Up" : "Login"}
                    </h1>
                    <p className="demo-note">Demo accounts are stored in this browser. Use a sample password.</p>
                    <form className = "auth-form" onSubmit = { handleSubmit(onSubmit) }>

                        {error && <div className = "error-message" role="alert">{error}</div>}
                        <div className = "form-group">
                            <label className = "form-label" htmlFor = "email">Email</label>
                            <input className = "form-input" type = "email" id = "email" autoComplete="email" {...register("email", {required: "Email is required"})}/>
                            {errors.email && <p className = "form-error" role = "alert">{errors.email.message}</p>}
                        </div>
                        <div className = "form-group">
                            <label className = "form-label" htmlFor = "password">Password</label>
                            <input className = "form-input" type = "password" id = "password" autoComplete={mode === "signup" ? "new-password" : "current-password"} {...register("password", {required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                },
                                maxLength: {
                                    value: 12,
                                    message: "Password must be 12 characters or fewer",
                                },

                            })}/>
                            {errors.password && <p className = "form-error" role = "alert">{errors.password.message}</p>}
                        </div>

                        <button type = "submit" className = "btn btn-primary btn-large">{mode === "signup" ? "Sign Up" : "Login"}</button>
                    </form>

                    <div className = "auth-switch">
                        {mode === "signup" ? (<p>Already have an account?{" "} <button type="button" className = "auth-link" onClick = {() => switchMode("login")}>Login</button></p>)
                        : (<p>{" "}Don't have an account? <button type="button" className = "auth-link" onClick = {() => switchMode("signup")}>Sign Up</button></p>)}
                    </div>
                </div>
            </div>
        </div>
    )
}
