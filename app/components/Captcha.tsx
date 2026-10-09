"use client";

import { useState, useEffect } from 'react';

interface CaptchaProps {
  onVerify: (isVerified: boolean) => void;
  className?: string;
}

export default function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  // Generate random numbers between 1 and 10
  const generateChallenge = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsVerified(false);
    setError('');
    onVerify(false);
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setUserAnswer(value);
    setError('');

    // Auto-verify when user enters correct answer
    if (value && parseInt(value) === num1 + num2) {
      setIsVerified(true);
      onVerify(true);
    } else if (isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleVerify = () => {
    const answer = parseInt(userAnswer);
    if (!userAnswer) {
      setError('Please enter an answer');
      return;
    }

    if (answer === num1 + num2) {
      setIsVerified(true);
      setError('');
      onVerify(true);
    } else {
      setIsVerified(false);
      setError('Incorrect answer. Please try again.');
      onVerify(false);
      setUserAnswer('');
      // Regenerate challenge after wrong answer
      setTimeout(() => {
        generateChallenge();
      }, 500);
    }
  };

  return (
    <div className={`bg-pathik-bg-light border-[2px] border-pathik-border rounded-[12px] p-5 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <i className="fas fa-shield-alt text-pathik-primary text-lg"></i>
        <label className="block text-[0.9rem] font-[600] text-pathik-text-dark">
          Security Verification
        </label>
        {isVerified && (
          <i className="fas fa-check-circle text-green-500 ml-auto text-lg animate-[scaleIn_0.3s_ease-out]"></i>
        )}
      </div>
      
      <div className="bg-white border-[2px] border-pathik-border rounded-[10px] p-4 mb-3">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-[1.8rem] font-[700] text-pathik-text-dark bg-pathik-primary/10 px-4 py-2 rounded-lg">
            {num1}
          </span>
          <span className="text-[1.5rem] text-pathik-text-medium font-[600]">+</span>
          <span className="text-[1.8rem] font-[700] text-pathik-text-dark bg-pathik-primary/10 px-4 py-2 rounded-lg">
            {num2}
          </span>
          <span className="text-[1.5rem] text-pathik-text-medium font-[600]">=</span>
          <input
            type="text"
            value={userAnswer}
            onChange={handleAnswerChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleVerify();
              }
            }}
            className={`w-20 text-center text-[1.8rem] font-[700] border-[2px] rounded-lg py-2 transition-all duration-300 focus:outline-none ${
              isVerified
                ? 'border-green-500 bg-green-50 text-green-700'
                : error
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-pathik-border focus:border-pathik-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]'
            }`}
            placeholder="?"
            disabled={isVerified}
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-xs mb-2 flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={generateChallenge}
          className="flex items-center gap-2 text-pathik-text-medium hover:text-pathik-primary transition-colors duration-300 text-sm font-[600] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isVerified}
        >
          <i className="fas fa-refresh"></i>
          <span>New Challenge</span>
        </button>
        
        {!isVerified && (
          <button
            type="button"
            onClick={handleVerify}
            className="px-4 py-2 bg-pathik-primary text-white text-sm font-[600] rounded-lg hover:bg-pathik-primary-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userAnswer}
          >
            Verify
          </button>
        )}
        
        {isVerified && (
          <div className="text-green-600 text-sm font-[600] flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span>Verified</span>
          </div>
        )}
      </div>

      <p className="text-[0.75rem] text-pathik-text-light mt-3 text-center">
        Please solve the math problem to verify you are human
      </p>
    </div>
  );
}