
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const AuthPage: React.FC = () => {
  const { login } = useUserStore();
  const [email, setEmail] = useState('demo@nutritrack.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Demo User');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name, email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-900 to-neutral-800 font-sans">
      <div className="absolute inset-0 bg-grid-white/5"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Card className="w-full max-w-sm">
          <h1 className="text-4xl font-bold text-center mb-2 text-white">NutriTrack</h1>
          <p className="text-center text-neutral-400 mb-8">{isLogin ? "Welcome back" : "Create an account"}</p>
          
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
            <Button type="submit" className="w-full">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
          
          <p className="text-center text-sm text-neutral-400 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-accent hover:underline ml-2"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
