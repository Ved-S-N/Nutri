import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthPage: React.FC = () => {
  const { login } = useUserStore();
  const [email, setEmail] = useState("demo@nutritrack.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("Demo User");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${API_URL}/api/auth/login`
        : `${API_URL}/api/auth/register`;

      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Authentication failed");

      // ✅ store token and user in Zustand
      login({
        id: data.id,
        name: data.name,
        email: data.email,
        token: data.token,
        goalWeight: data.goalWeight,
        goalMode: data.goalMode,
        currentWeight: data.currentWeight,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-900 to-neutral-800 font-sans">
      <div className="absolute inset-0 bg-grid-white/5"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <Card className="w-full max-w-sm">
          <h1 className="text-4xl font-bold text-center mb-2 text-white">
            NutriTrack
          </h1>
          <p className="text-center text-neutral-400 mb-8">
            {isLogin ? "Welcome back" : "Create an account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <Input
                id="name"
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-center text-red-400 text-sm -mt-4">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Signing up..."
                : isLogin
                ? "Log In"
                : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-400 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-accent hover:underline ml-2"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
