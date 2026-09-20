"use client";

import { useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";

export default function ShowcasePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealImgRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(login, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/admin");
    }
  }, [state?.success, router]);

  const text = "Access the studio mainframe to edit the journey.";
  const words = text.split(" ");

  useEffect(() => {
    const canvas = canvasRef.current;
    const imgLayer = revealImgRef.current;
    if (!canvas || !imgLayer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPOTLIGHT_R = 260;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const mouse = { x: -999, y: -999 };
    const smooth = { x: -999, y: -999 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let rafId: number;
    const loop = () => {
      smooth.x += (mouse.x - smooth.x) * 0.1;
      smooth.y += (mouse.y - smooth.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(
        smooth.x, smooth.y, 0, 
        smooth.x, smooth.y, SPOTLIGHT_R
      );
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, "rgba(255,255,255,1)");
      grad.addColorStop(0.6, "rgba(255,255,255,0.75)");
      grad.addColorStop(0.75, "rgba(255,255,255,0.4)");
      grad.addColorStop(0.88, "rgba(255,255,255,0.12)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.beginPath();
      ctx.arc(smooth.x, smooth.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      const dataUrl = canvas.toDataURL();
      imgLayer.style.webkitMaskImage = `url(${dataUrl})`;
      imgLayer.style.maskImage = `url(${dataUrl})`;
      imgLayer.style.webkitMaskSize = "100% 100%";
      imgLayer.style.maskSize = "100% 100%";

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Creative Studio Showcase</title>
      </Head>

      <div className="showcase-wrapper">
        {/* SPLASH */}
        <div className="splash" id="splash">
          <div className="splash-row splash-row-top">
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
          </div>
          <div className="splash-row splash-row-bottom">
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
            <div className="splash-box"></div>
          </div>
        </div>

        {/* LOGO */}
        <div className="logo-wrapper pointer-events-auto">
          <div className="inner">
            <Link href="/" aria-label="Home">
              <img src="https://framerusercontent.com/images/VMcS7YYTM5PXfXvlHc9u3hSCMM.svg" alt="Logo" />
            </Link>
          </div>
        </div>


        {/* HERO */}
        <main className="hero pointer-events-auto">
          {/* Big text behind image */}
          <div className="hero-big-text creator-text-animate">
            <h2>SANSKAR</h2>
          </div>

          {/* Base image */}
          <div 
            className="hero-base-img hero-image-animate"
            style={{ backgroundImage: "url('https://soft-zoom-63098134.figma.site/_assets/v11/5c9f982199fde1d9b85a20e5396f0fa7bacaf9a3.png?w=2560')" }}
          ></div>

          {/* Reveal layer */}
          <canvas id="reveal-canvas" ref={canvasRef}></canvas>
          <div 
            className="hero-reveal-img" 
            id="reveal-img"
            ref={revealImgRef}
            style={{ backgroundImage: "url('https://soft-zoom-63098134.figma.site/_assets/v11/6be2165e31648955b4e071f4cf2a50bc572b9bfd.png?w=1536')" }}
          ></div>

          {/* Content */}
          <div className="hero-content">
            <div className="hero-content-inner">
              <h1 className="hero-headline" id="headline">
                {words.map((word, i) => (
                  <span 
                    key={i} 
                    className="word-reveal" 
                    style={{ animationDelay: `${1 + i * 0.05}s` }}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <form action={formAction} className="login-form cta-animate">
                {state?.error && (
                  <div style={{ color: "#ff6b6b", fontSize: "0.875rem", marginBottom: "1rem", textAlign: "center" }}>
                    {state.error}
                  </div>
                )}
                
                <div className="input-group">
                  <input type="email" id="email" name="email" placeholder=" " required className="login-input" autoComplete="off" />
                  <label htmlFor="email" className="login-label">Email Address</label>
                </div>
                
                <div className="input-group">
                  <input type="password" id="password" name="password" placeholder=" " required className="login-input" autoComplete="new-password" />
                  <label htmlFor="password" className="login-label">Password</label>
                </div>
                
                <button type="submit" className="cta-btn" style={{ marginTop: "16px" }} disabled={pending}>
                  <span className="cta-btn-bg"></span>
                  <span className="cta-btn-text">{pending ? "Authenticating..." : "Authenticate"}</span>
                  <span className="cta-btn-circle">
                    {pending ? (
                      <div className="spinner"></div>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L13 5M13 5H6M13 5V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </main>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          .showcase-wrapper {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #E4E4E4;
            color: #F4F1E8;
            overflow-x: hidden;
            scroll-behavior: smooth;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100vh;
          }
          
          .showcase-wrapper *, .showcase-wrapper *::before, .showcase-wrapper *::after { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
          }

          /* ===== SPLASH ===== */
          .splash {
            position: fixed; inset: 0;
            width: 100vw; height: 100vh;
            z-index: 9999;
            pointer-events: none;
            overflow: hidden;
            animation: splashHide 0.3s ease forwards;
            animation-delay: 1.35s;
          }
          .splash-row { display: flex; width: 100%; height: 50%; }
          .splash-box { width: 20%; height: 100%; background: #75C5DE; }
          .splash-row-top .splash-box { animation: splashTop 1s cubic-bezier(0.96,-0.02,0.38,1.01) forwards; }
          .splash-row-bottom .splash-box { animation: splashBottom 1s cubic-bezier(0.96,-0.02,0.38,1.01) forwards; }
          .splash-box:nth-child(1) { animation-delay: 0s; }
          .splash-box:nth-child(2) { animation-delay: 0.05s; }
          .splash-box:nth-child(3) { animation-delay: 0.1s; }
          .splash-box:nth-child(4) { animation-delay: 0.15s; }
          .splash-box:nth-child(5) { animation-delay: 0.2s; }

          @keyframes splashTop { from { transform: translateY(0%); } to { transform: translateY(-100%); } }
          @keyframes splashBottom { from { transform: translateY(0%); } to { transform: translateY(100%); } }
          @keyframes splashHide { to { opacity: 0; visibility: hidden; } }

          /* ===== HERO IMAGE ENTRANCE ===== */
          @keyframes heroImageIn {
            from { opacity: 0; transform: scale(1.5) rotate(3deg); }
            to { opacity: 1; transform: scale(1) rotate(0deg); }
          }
          .hero-image-animate {
            animation: heroImageIn 1.2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
            animation-delay: 1s;
            opacity: 0;
          }

          /* ===== WORD REVEAL ===== */
          @keyframes wordReveal {
            from { opacity: 0; transform: translateY(10px); filter: blur(10px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          .word-reveal {
            opacity: 0;
            display: inline-block;
            margin-right: 0.3em;
            animation: wordReveal 0.4s ease forwards;
          }

          /* ===== CTA ENTRANCE ===== */
          @keyframes slideUpScale {
            from { opacity: 0; transform: translateY(60px) scale(0.4); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .cta-animate {
            opacity: 0;
            animation: slideUpScale 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
            animation-delay: 1s;
          }

          /* ===== SPINNER ===== */
          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* ===== LOGIN FORM ===== */
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            max-width: 360px;
            margin-top: 10px;
          }
          
          .input-group {
            position: relative;
            width: 100%;
          }

          .login-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(17, 17, 17, 0.1);
            border-radius: 14px;
            padding: 24px 16px 8px 16px;
            font-size: 16px;
            color: #111111;
            outline: none;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            font-family: inherit;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          
          .login-input:hover {
            background: rgba(255, 255, 255, 0.4);
            border-color: rgba(17, 17, 17, 0.2);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2), 0 6px 16px rgba(0, 0, 0, 0.04);
          }

          .login-input:focus {
            background: rgba(255, 255, 255, 0.7);
            border-color: rgba(17, 17, 17, 0.4);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.06);
          }
          
          .login-label {
            position: absolute;
            left: 16px;
            top: 17px;
            font-size: 16px;
            color: rgba(17, 17, 17, 0.5);
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            font-family: inherit;
          }
          
          .login-input:focus ~ .login-label,
          .login-input:not(:placeholder-shown) ~ .login-label {
            top: 8px;
            font-size: 11px;
            font-weight: 600;
            color: #111111;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          /* ===== CTA BUTTON ===== */
          .cta-btn { position: relative; overflow: hidden; display: flex; align-items: center; border: none; background: none; cursor: pointer; border-radius: 9999px; padding: 8px; gap: 12px; }
          .cta-btn-bg {
            position: absolute; top: 5px; bottom: 5px; left: 8px;
            width: calc(100% - 8px - 8px - 48px - 12px);
            border-radius: 9999px; background: white; z-index: 0;
            transition: width 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
          }
          @media (min-width: 768px) { .cta-btn-bg { width: calc(100% - 8px - 8px - 54px - 12px); } }
          .cta-btn:hover .cta-btn-bg { width: calc(100% - 16px); }
          .cta-btn-text { position: relative; z-index: 1; color: #111111; font-weight: 500; font-size: 16px; padding: 12px 32px; white-space: nowrap; }
          @media (min-width: 768px) { .cta-btn-text { font-size: 18px; padding: 16px 40px; } }
          .cta-btn-circle {
            position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;
            width: 48px; height: 48px; border-radius: 50%; background: #75C5DE; flex-shrink: 0;
            transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
          }
          @media (min-width: 768px) { .cta-btn-circle { width: 54px; height: 54px; } }
          .cta-btn:hover .cta-btn-circle { transform: translateX(-7px); }

          /* ===== MENU CTA (smaller) ===== */
          .menu-cta-btn { position: relative; overflow: hidden; display: flex; align-items: center; border: none; background: none; cursor: pointer; border-radius: 9999px; padding: 6px; gap: 8px; }
          .menu-cta-bg {
            position: absolute; top: 5px; bottom: 5px; left: 8px;
            width: calc(100% - 8px - 8px - 38px - 8px);
            border-radius: 9999px; background: white; z-index: 0;
            transition: width 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
          }
          .menu-cta-btn:hover .menu-cta-bg { width: calc(100% - 12px); }
          .menu-cta-text { position: relative; z-index: 1; color: #111111; font-weight: 500; font-size: 14px; padding: 8px 40px; white-space: nowrap; }
          .menu-cta-circle {
            position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;
            width: 38px; height: 38px; border-radius: 50%; background: #75C5DE; flex-shrink: 0;
            transition: transform 0.3s ease;
          }
          .menu-cta-btn:hover .menu-cta-circle { transform: translateX(-4px); }

          /* ===== CREATOR TEXT ===== */
          @keyframes creatorSlideUp { from { transform: translateY(330px); } to { transform: translateY(0); } }
          .creator-text-animate {
            transform: translateY(330px);
            animation: creatorSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards;
            animation-delay: 1.5s;
          }

          /* ===== NAVIGATION ===== */
          .logo-wrapper {
            position: fixed; top: 30px; left: 0; width: 50%; z-index: 10;
            display: flex; justify-content: flex-start; align-items: center; mix-blend-mode: difference;
          }
          @media (min-width: 768px) { .logo-wrapper { top: 40px; } }
          .logo-wrapper .inner { padding-left: 20px; }
          @media (min-width: 768px) { .logo-wrapper .inner { padding-left: 40px; } }
          .logo-wrapper img { width: 32px; height: 32px; }

          /* ===== HERO ===== */
          .hero {
            position: relative; width: 100%; overflow: hidden;
            background: #E4E4E4; min-height: 100vh;
          }
          @media (min-width: 768px) { .hero { height: 100vh; min-height: 800px; } }

          .hero-big-text {
            position: absolute; bottom: -30px; left: 0; right: 0; z-index: 2;
            pointer-events: none; width: 100%; text-align: center;
          }
          @media (min-width: 768px) { .hero-big-text { bottom: -40px; } }
          .hero-big-text h2 {
            font-weight: 500; color: #F4F1E8; line-height: 80%;
            letter-spacing: -0.04em; white-space: nowrap;
            font-size: clamp(60px, 14vw, 350px);
          }

          .hero-base-img {
            position: absolute; top: 30vh; left: 0; right: 0; bottom: 0;
            background-size: cover; background-repeat: no-repeat;
            background-position: 60% center; z-index: 5;
          }
          @media (min-width: 768px) { .hero-base-img { top: 0; background-position: center; } }

          .hero-reveal-img {
            position: absolute; top: 30vh; left: 0; right: 0; bottom: 0;
            background-size: cover; background-repeat: no-repeat;
            background-position: 60% center; z-index: 7; pointer-events: none;
          }
          @media (min-width: 768px) { .hero-reveal-img { top: 0; background-position: center; } }

          .hero-content {
            position: relative; z-index: 8;
            display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;
            width: 100%; max-width: 1600px; margin: 0 auto;
            padding: 110px 16px 24px 16px; pointer-events: none;
          }
          @media (min-width: 768px) {
            .hero-content {
              position: absolute; inset: 0;
              justify-content: space-between;
              padding: 160px 40px 100px 40px;
            }
          }
          .hero-content-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 30px; width: 100%; pointer-events: auto; }

          .hero-headline {
            font-size: 22px; font-weight: 500; line-height: 120%;
            letter-spacing: -0.02em; color: #111111; max-width: 447px;
          }
          @media (min-width: 768px) { .hero-headline { font-size: 28px; } }

          /* ===== CANVAS (hidden) ===== */
          #reveal-canvas { display: none; position: absolute; inset: 0; pointer-events: none; }

          /* ===== REDUCED MOTION ===== */
          @media (prefers-reduced-motion: reduce) {
            .splash { animation: splashHide 0.01s linear forwards; }
            .splash-box { animation: none !important; }
            .hero-image-animate, .word-reveal, .cta-animate, .creator-text-animate {
              animation: none !important; opacity: 1 !important;
              transform: none !important; filter: none !important; visibility: visible !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
