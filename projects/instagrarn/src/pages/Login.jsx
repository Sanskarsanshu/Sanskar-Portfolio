import { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const isFormValid = username.length > 0 && password.length >= 6;

  const handleLogin = (e) => {
    e.preventDefault();
    if (isFormValid) {
      alert('Login demo – redirect or validation would happen here.');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] flex flex-col items-center justify-center font-sans">
      
      {/* Main Container */}
      <main className="w-full max-w-[350px] mt-8 flex flex-col items-center">
        
        {/* Top Box: Login Form */}
        <div className="w-full border border-[#363636] bg-[#000000] px-10 py-10 flex flex-col items-center">
          
          {/* Authentic Instagram Wordmark */}
          <div className="mb-10 w-full flex justify-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1024px-Instagram_logo.svg.png" 
              alt="Instagram" 
              className="h-[52px] object-contain invert"
            />
          </div>

          <form className="w-full flex flex-col gap-2" onSubmit={handleLogin} noValidate>
            
            <div className="relative w-full">
              <input 
                type="text" 
                id="username" 
                placeholder=" " 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="peer h-[38px] w-full rounded-[3px] border border-[#363636] bg-[#121212] px-2 pb-[2px] pt-[14px] text-[12px] text-[#f5f5f5] outline-none transition-colors focus:border-[#a8a8a8]" 
                required 
              />
              <label 
                htmlFor="username" 
                className="pointer-events-none absolute left-2 top-[10px] -translate-y-1/2 px-[2px] text-[10px] text-[#8e8e8e] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[12px] peer-focus:top-[10px] peer-focus:text-[10px]"
              >
                Phone number, username, or email
              </label>
            </div>

            <div className="relative w-full">
              <input 
                type="password" 
                id="password" 
                placeholder=" " 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer h-[38px] w-full rounded-[3px] border border-[#363636] bg-[#121212] px-2 pb-[2px] pt-[14px] text-[12px] text-[#f5f5f5] outline-none transition-colors focus:border-[#a8a8a8]" 
                required 
              />
              <label 
                htmlFor="password" 
                className="pointer-events-none absolute left-2 top-[10px] -translate-y-1/2 px-[2px] text-[10px] text-[#8e8e8e] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[12px] peer-focus:top-[10px] peer-focus:text-[10px]"
              >
                Password
              </label>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid}
              className={`mt-2 h-[32px] w-full rounded-lg text-[14px] font-semibold text-white transition-opacity ${isFormValid ? 'bg-[#0095f6] hover:bg-[#1877f2] cursor-pointer' : 'bg-[#0095f6] opacity-70 cursor-default'}`}
            >
              Log in
            </button>
            
            <div className="my-3 flex w-full items-center gap-[18px]">
              <div className="h-[1px] flex-1 bg-[#363636]"></div>
              <span className="text-[13px] font-semibold text-[#8e8e8e] uppercase">or</span>
              <div className="h-[1px] flex-1 bg-[#363636]"></div>
            </div>

            <button 
              className="flex w-full items-center justify-center gap-2 bg-transparent py-1 text-[14px] font-semibold text-[#E0F1FF] hover:text-white transition-colors"
              onClick={(e) => { e.preventDefault(); alert('Facebook login flow (demo)'); }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#385185]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Log in with Facebook</span>
            </button>

            <a href="#" className="mt-3 text-center text-[12px] text-[#E0F1FF] hover:text-white" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </form>
        </div>

        {/* Bottom Box: Sign up */}
        <div className="mt-2.5 w-full border border-[#363636] bg-[#000000] py-5 text-center text-[14px]">
          <span className="text-[#f5f5f5]">Don't have an account? </span>
          <a href="#" className="font-semibold text-[#0095f6] hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
            Sign up
          </a>
        </div>

        {/* Get the app section */}
        <div className="mt-4 flex flex-col items-center">
          <span className="text-[14px] text-[#f5f5f5]">Get the app.</span>
          <div className="mt-4 flex justify-center gap-2">
            <img 
              src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png" 
              alt="Get it on Google Play" 
              className="h-[40px] cursor-pointer"
            />
            <img 
              src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png" 
              alt="Get it from Microsoft" 
              className="h-[40px] cursor-pointer"
            />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto mb-12 flex w-full max-w-[1000px] flex-col items-center px-4 pt-16">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
          {['Meta', 'About', 'Blog', 'Jobs', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Instagram Lite', 'Threads', 'Contact Uploading & Non-Users', 'Meta Verified'].map(link => (
            <a key={link} href="#" className="text-[12px] text-[#8e8e8e] hover:underline">
              {link}
            </a>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-[12px] text-[#8e8e8e]">
          <span className="flex cursor-default items-center gap-1">
            English 
            <svg fill="currentColor" viewBox="0 0 24 24" className="h-3 w-3"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </span>
          <div className="flex items-center gap-1.5">
            {/* Real Meta Logo SVG */}
            <svg viewBox="0 0 40 16" fill="currentColor" className="h-[12px] w-auto">
              <path d="M12.9 5.8c-2.4 0-4.6 1-6.1 2.8C5.2 6.8 3.1 5.8.6 5.8v2.4c1.8 0 3.3.7 4.4 1.9C3.9 11.2 2.3 12 1 12v2.4c2.4 0 4.6-1 6.1-2.8 1.6 1.8 3.7 2.8 6.2 2.8v-2.4c-1.8 0-3.3-.7-4.4-1.9 1.1-1.1 2.7-1.9 4-1.9V5.8zm21.4 0c-3 0-5.5 2.1-6.2 5h-4.4c-.7-2.9-3.2-5-6.2-5v2.4c1.6 0 2.9 1.1 3.2 2.6H28c.3-1.5 1.6-2.6 3.2-2.6 1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2c-1.6 0-2.9-1.1-3.2-2.6H20.7c-.7 2.9-3.2 5-6.2 5 3.3 0 6.1-2.4 6.7-5.6H28c.6 3.2 3.4 5.6 6.7 5.6 3.8 0 6.8-3 6.8-6.8s-3-6.8-6.8-6.8z" />
            </svg>
            <span>© 2026 Instagram from Meta</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login;