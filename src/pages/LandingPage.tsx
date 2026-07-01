import { useEffect } from "react";

interface Props {
  onRegister: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onRegister, onLogin }: Props) {
  useEffect(() => {
    const toggle = document.getElementById("pricingToggle");
    const toggleLabels = document.querySelectorAll<HTMLElement>(".toggle-label");
    const priceAmounts = document.querySelectorAll<HTMLElement>(".price-amount");
    let isYearly = false;
    const handleToggle = () => {
      isYearly = !isYearly;
      toggle?.classList.toggle("active", isYearly);
      toggleLabels.forEach((l) => {
        const p = l.dataset.period;
        l.classList.toggle("active", (p === "year" && isYearly) || (p === "month" && !isYearly));
      });
      priceAmounts.forEach((a) => {
        a.textContent = Number(isYearly ? a.dataset.year : a.dataset.month).toLocaleString("ru-RU");
      });
    };
    toggle?.addEventListener("click", handleToggle);

    const faqItems = document.querySelectorAll<HTMLElement>(".faq-item");
    const faqHandlers: Array<() => void> = [];
    faqItems.forEach((item) => {
      const h = () => {
        const was = item.classList.contains("active");
        faqItems.forEach((i) => i.classList.remove("active"));
        if (!was) item.classList.add("active");
      };
      faqHandlers.push(h);
      item.addEventListener("click", h);
    });

    const navbar = document.querySelector<HTMLElement>(".lp-navbar");
    const onScroll = () => {
      if (navbar) navbar.style.boxShadow = window.scrollY > 20 ? "0 4px 20px rgba(0,0,0,0.06)" : "none";
    };
    window.addEventListener("scroll", onScroll);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll<HTMLElement>(".anim-card").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      obs.observe(el);
    });

    return () => {
      toggle?.removeEventListener("click", handleToggle);
      faqItems.forEach((item, i) => item.removeEventListener("click", faqHandlers[i]));
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        :root{
          --pr:#0077FF;--sec:#7B61FF;--acc:#00D4AA;
          --dark:#0A0E27;--dark2:#151935;
          --g7:#4A5280;--g5:#8B92B8;--g3:#C8CEE0;--g1:#F0F2F8;
          --grad:linear-gradient(135deg,#0077FF 0%,#7B61FF 100%);
        }
        html{scroll-behavior:smooth}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:var(--dark);background:#fff;overflow-x:hidden}
        .lp-container{max-width:1240px;margin:0 auto;padding:0 24px}

        /* NAV */
        .lp-navbar{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.05);transition:all .3s}
        .lp-nav-wrap{display:flex;justify-content:space-between;align-items:center;padding:16px 0}
        .lp-logo{display:flex;align-items:center;gap:10px;font-size:1.4rem;font-weight:800;color:var(--dark);text-decoration:none}
        .lp-logo-icon{width:36px;height:36px;background:var(--grad);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;box-shadow:0 8px 20px rgba(0,119,255,.3)}
        .lp-nav-links{display:flex;gap:2rem;list-style:none}
        .lp-nav-links a{color:var(--g7);text-decoration:none;font-weight:500;font-size:.95rem;transition:color .2s}
        .lp-nav-links a:hover{color:var(--pr)}

        /* BUTTONS */
        .lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:600;font-size:.95rem;text-decoration:none;cursor:pointer;border:none;transition:all .3s;white-space:nowrap}
        .lp-btn-primary{background:var(--grad);color:#fff;box-shadow:0 8px 20px rgba(0,119,255,.3)}
        .lp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,119,255,.4)}
        .lp-btn-outline{background:#fff;color:var(--dark);border:2px solid var(--g3)}
        .lp-btn-outline:hover{border-color:var(--pr);color:var(--pr)}
        .lp-btn-lg{padding:16px 32px;font-size:1.05rem}

        /* HERO */
        .lp-hero{padding:140px 0 80px;position:relative;overflow:hidden;background:radial-gradient(ellipse at top,rgba(0,119,255,.08) 0%,transparent 60%),radial-gradient(ellipse at bottom right,rgba(123,97,255,.08) 0%,transparent 60%)}
        .lp-hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(0,119,255,.12) 0%,transparent 70%);filter:blur(60px);z-index:-1}
        .lp-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .lp-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(0,119,255,.1);color:var(--pr);border-radius:100px;font-size:.85rem;font-weight:600;margin-bottom:24px;border:1px solid rgba(0,119,255,.2)}
        .lp-badge::before{content:'';width:8px;height:8px;background:var(--acc);border-radius:50%;animation:lpPulse 2s infinite}
        @keyframes lpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}
        .lp-hero h1{font-size:3.75rem;font-weight:800;line-height:1.1;letter-spacing:-.02em;margin-bottom:24px}
        .lp-grad-text{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-hero-sub{font-size:1.2rem;color:var(--g7);margin-bottom:32px;max-width:520px}
        .lp-hero-cta{display:flex;gap:16px;margin-bottom:40px;flex-wrap:wrap}
        .lp-hero-stats{display:flex;gap:40px;padding-top:32px;border-top:1px solid var(--g1)}
        .lp-stat-val{font-size:2rem;font-weight:800;line-height:1}
        .lp-stat-lbl{font-size:.85rem;color:var(--g5);margin-top:4px}

        /* MOCKUP */
        .lp-visual{position:relative}
        .lp-hero-img{width:100%;border-radius:20px;box-shadow:0 40px 80px rgba(10,14,39,.15),0 0 0 1px rgba(0,0,0,.05);display:block;object-fit:cover}
        .lp-mockup{background:#fff;border-radius:20px;box-shadow:0 40px 80px rgba(10,14,39,.15),0 0 0 1px rgba(0,0,0,.05);overflow:hidden}
        .lp-mock-hdr{background:var(--g1);padding:12px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(0,0,0,.05)}
        .lp-dot{width:12px;height:12px;border-radius:50%;background:#FF5F57}
        .lp-dot:nth-child(2){background:#FEBC2E}
        .lp-dot:nth-child(3){background:#28C840}
        .lp-mock-body{padding:24px;min-height:400px;background:linear-gradient(180deg,#F8FAFF 0%,#fff 100%);position:relative;background-image:linear-gradient(rgba(0,119,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,.05) 1px,transparent 1px);background-size:20px 20px}
        .lp-node{background:#fff;border-radius:12px;padding:12px 16px;box-shadow:0 4px 12px rgba(0,0,0,.08);position:absolute;display:flex;align-items:center;gap:10px;font-size:.88rem;font-weight:600;border:2px solid transparent}
        .lp-node-icon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.95rem}
        .n1{top:28px;left:28px;border-color:#00D4AA;animation:nf 3s ease-in-out infinite}
        .n1 .lp-node-icon{background:rgba(0,212,170,.15)}
        .n2{top:120px;left:170px;border-color:#FFB800;animation:nf 3s ease-in-out infinite .5s}
        .n2 .lp-node-icon{background:rgba(255,184,0,.15)}
        .n3{top:215px;left:55px;border-color:#0077FF;animation:nf 3s ease-in-out infinite 1s}
        .n3 .lp-node-icon{background:rgba(0,119,255,.15)}
        .n4{top:305px;left:220px;border-color:#7B61FF;animation:nf 3s ease-in-out infinite 1.5s}
        .n4 .lp-node-icon{background:rgba(123,97,255,.15)}
        @keyframes nf{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .lp-svg-lines{position:absolute;inset:0;pointer-events:none;overflow:visible}
        .lp-float{position:absolute;background:#fff;border-radius:16px;padding:14px 18px;box-shadow:0 20px 40px rgba(0,0,0,.12);display:flex;align-items:center;gap:12px}
        .lp-float-1{top:-18px;right:-18px;animation:fc 4s ease-in-out infinite}
        .lp-float-2{bottom:36px;left:-28px;animation:fc 4s ease-in-out infinite 1s}
        @keyframes fc{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .lp-float-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem}
        .lp-float-1 .lp-float-icon{background:rgba(0,212,170,.15)}
        .lp-float-2 .lp-float-icon{background:rgba(123,97,255,.15)}
        .lp-float-txt strong{display:block;font-size:.88rem;color:var(--dark)}
        .lp-float-txt span{font-size:.73rem;color:var(--g5)}

        /* TRUST */
        .lp-trust{padding:50px 0;background:var(--g1)}
        .lp-trust-ttl{text-align:center;color:var(--g5);font-size:.88rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:28px}
        .lp-trust-logos{display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:32px}
        .lp-trust-logo{font-size:1.4rem;font-weight:800;color:var(--g5);opacity:.7;transition:opacity .3s}
        .lp-trust-logo:hover{opacity:1;color:var(--dark)}

        /* SECTIONS */
        .lp-section{padding:100px 0}
        .lp-sec-hdr{text-align:center;max-width:700px;margin:0 auto 56px}
        .lp-tag{display:inline-block;padding:6px 14px;background:rgba(0,119,255,.1);color:var(--pr);border-radius:100px;font-size:.85rem;font-weight:600;margin-bottom:14px}
        .lp-sec-title{font-size:2.75rem;font-weight:800;line-height:1.15;letter-spacing:-.02em;margin-bottom:14px}
        .lp-sec-sub{font-size:1.1rem;color:var(--g7)}

        /* FEATURES */
        .lp-features-bg{background:#fff}
        .lp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
        .lp-feat-card{background:#fff;padding:30px;border-radius:20px;border:1px solid var(--g1);transition:all .3s;position:relative;overflow:hidden}
        .lp-feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);transform:scaleX(0);transform-origin:left;transition:transform .4s}
        .lp-feat-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(10,14,39,.07);border-color:transparent}
        .lp-feat-card:hover::before{transform:scaleX(1)}
        .lp-feat-icon{width:52px;height:52px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:18px}
        .fi-b{background:rgba(0,119,255,.12)}.fi-p{background:rgba(123,97,255,.12)}.fi-g{background:rgba(0,212,170,.12)}.fi-o{background:rgba(255,152,0,.12)}.fi-pk{background:rgba(255,64,129,.12)}.fi-c{background:rgba(0,188,212,.12)}
        .lp-feat-card h3{font-size:1.2rem;font-weight:700;margin-bottom:8px}
        .lp-feat-card p{color:var(--g7);font-size:.93rem}

        /* STEPS */
        .lp-steps-bg{background:var(--g1)}
        .lp-steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
        .lp-step{background:#fff;padding:28px 22px;border-radius:20px;text-align:center;transition:transform .3s}
        .lp-step:hover{transform:translateY(-4px)}
        .lp-step-num{width:46px;height:46px;background:var(--grad);color:#fff;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;font-weight:800;margin:0 auto 18px;box-shadow:0 8px 20px rgba(0,119,255,.3)}
        .lp-step h3{font-size:1.1rem;font-weight:700;margin-bottom:8px}
        .lp-step p{color:var(--g7);font-size:.88rem}

        /* PRICING */
        .lp-pricing-bg{background:#fff}
        .lp-ptoggle{display:flex;justify-content:center;align-items:center;gap:14px;margin-bottom:44px}
        .toggle-label{font-weight:600;color:var(--g7)}.toggle-label.active{color:var(--dark)}
        .toggle-switch{position:relative;width:54px;height:28px;background:var(--g3);border-radius:100px;cursor:pointer;transition:background .3s}
        .toggle-switch.active{background:var(--grad)}
        .toggle-switch::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;background:#fff;border-radius:50%;transition:transform .3s;box-shadow:0 2px 6px rgba(0,0,0,.2)}
        .toggle-switch.active::after{transform:translateX(26px)}
        .save-badge{background:rgba(0,212,170,.15);color:#00A884;padding:4px 10px;border-radius:100px;font-size:.73rem;font-weight:700}
        .lp-pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:stretch}
        .lp-pcard{background:#fff;border:2px solid var(--g1);border-radius:22px;padding:36px 28px;position:relative;transition:all .3s;display:flex;flex-direction:column}
        .lp-pcard:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(10,14,39,.07)}
        .lp-pcard.featured{background:var(--dark);color:#fff;border-color:var(--dark);transform:scale(1.03);box-shadow:0 30px 60px rgba(10,14,39,.2)}
        .lp-pcard.featured:hover{transform:scale(1.03) translateY(-4px)}
        .pop-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--grad);color:#fff;padding:5px 14px;border-radius:100px;font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
        .plan-name{font-size:1.05rem;font-weight:700;margin-bottom:7px}
        .plan-desc{color:var(--g5);font-size:.88rem;margin-bottom:22px}
        .featured .plan-desc{color:rgba(255,255,255,.6)}
        .plan-price{display:flex;align-items:baseline;gap:5px;margin-bottom:7px}
        .price-amount{font-size:2.8rem;font-weight:800;line-height:1;color:var(--dark)}
        .featured .price-amount{color:#fff}
        .price-cur{font-size:1.4rem;font-weight:700;color:var(--dark)}
        .featured .price-cur{color:#fff}
        .price-per{color:var(--g5);font-size:.88rem;margin-bottom:28px}
        .featured .price-per{color:rgba(255,255,255,.6)}
        .plan-feats{list-style:none;margin-bottom:28px;flex-grow:1}
        .plan-feats li{display:flex;align-items:flex-start;gap:9px;padding:9px 0;font-size:.92rem;color:var(--g7)}
        .featured .plan-feats li{color:rgba(255,255,255,.85)}
        .plan-feats li::before{content:'✓';width:18px;height:18px;background:rgba(0,212,170,.15);color:var(--acc);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;flex-shrink:0;margin-top:2px}
        .plan-feats li.dis{opacity:.4}
        .plan-feats li.dis::before{content:'—';background:var(--g1);color:var(--g5)}
        .lp-pcard .lp-btn{width:100%}
        .featured .lp-btn-primary{background:#fff;color:var(--dark)}

        /* TESTIMONIALS */
        .lp-testi-bg{background:var(--g1)}
        .lp-tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
        .lp-tcard{background:#fff;padding:28px;border-radius:18px}
        .t-stars{color:#FFB800;margin-bottom:14px;font-size:1rem}
        .t-text{color:var(--g7);font-size:.92rem;margin-bottom:20px;line-height:1.7}
        .t-author{display:flex;align-items:center;gap:11px}
        .t-avatar{width:44px;height:44px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1rem}
        .t-info strong{display:block;color:var(--dark);font-size:.92rem}
        .t-info span{color:var(--g5);font-size:.82rem}

        /* FAQ */
        .lp-faq-bg{background:#fff}
        .lp-faq-list{max-width:760px;margin:0 auto}
        .faq-item{border-bottom:1px solid var(--g1);padding:22px 0;cursor:pointer}
        .faq-q{display:flex;justify-content:space-between;align-items:center;font-size:1.05rem;font-weight:600;color:var(--dark)}
        .faq-icon{width:30px;height:30px;background:var(--g1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--pr);transition:all .3s;flex-shrink:0;margin-left:14px}
        .faq-item.active .faq-icon{background:var(--pr);color:#fff;transform:rotate(45deg)}
        .faq-answer{max-height:0;overflow:hidden;transition:max-height .4s ease,padding .4s ease;color:var(--g7);font-size:.93rem}
        .faq-item.active .faq-answer{max-height:300px;padding-top:14px}

        /* CTA */
        .lp-cta{padding:100px 0;background:var(--dark);position:relative;overflow:hidden}
        .lp-cta::before{content:'';position:absolute;top:-50%;left:-20%;width:600px;height:600px;background:radial-gradient(circle,rgba(0,119,255,.3) 0%,transparent 70%);filter:blur(80px)}
        .lp-cta::after{content:'';position:absolute;bottom:-50%;right:-20%;width:600px;height:600px;background:radial-gradient(circle,rgba(123,97,255,.3) 0%,transparent 70%);filter:blur(80px)}
        .lp-cta-inner{position:relative;z-index:1;text-align:center;color:#fff;max-width:680px;margin:0 auto}
        .lp-cta-inner h2{font-size:2.8rem;font-weight:800;margin-bottom:18px;line-height:1.1}
        .lp-cta-inner p{font-size:1.15rem;color:rgba(255,255,255,.7);margin-bottom:32px}
        .lp-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .lp-cta-inner .lp-btn-primary{background:#fff;color:var(--dark)}
        .lp-cta-inner .lp-btn-outline{background:transparent;color:#fff;border-color:rgba(255,255,255,.3)}
        .lp-cta-inner .lp-btn-outline:hover{background:rgba(255,255,255,.1);border-color:#fff;color:#fff}

        /* FOOTER */
        .lp-footer{background:var(--dark2);color:rgba(255,255,255,.7);padding:56px 0 28px}
        .lp-fgrid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;margin-bottom:36px}
        .lp-fbrand p{margin-top:14px;font-size:.88rem;max-width:300px}
        .lp-flogo{color:#fff;text-decoration:none;display:flex;align-items:center;gap:9px;font-size:1.3rem;font-weight:800}
        .lp-fcol h4{color:#fff;font-size:.95rem;font-weight:700;margin-bottom:14px}
        .lp-fcol ul{list-style:none}
        .lp-fcol ul li{margin-bottom:9px}
        .lp-fcol a{color:rgba(255,255,255,.55);text-decoration:none;font-size:.88rem;transition:color .2s}
        .lp-fcol a:hover{color:#fff}
        .lp-fbot{padding-top:28px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;font-size:.82rem;flex-wrap:wrap;gap:14px}
        .lp-socials{display:flex;gap:10px}
        .lp-social{width:34px;height:34px;background:rgba(255,255,255,.1);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:.75rem;font-weight:700;transition:background .3s}
        .lp-social:hover{background:var(--pr)}

        /* RESPONSIVE */
        @media(max-width:968px){
          .lp-hero-grid{grid-template-columns:1fr;gap:36px}
          .lp-hero h1{font-size:2.4rem}
          .lp-sec-title{font-size:2rem}
          .lp-feat-grid,.lp-pgrid,.lp-tgrid{grid-template-columns:1fr}
          .lp-steps-grid{grid-template-columns:repeat(2,1fr)}
          .lp-fgrid{grid-template-columns:1fr 1fr}
          .lp-nav-links{display:none}
          .lp-pcard.featured{transform:scale(1)}
          .lp-cta-inner h2{font-size:2rem}
        }
        @media(max-width:568px){
          .lp-hero{padding:110px 0 56px}
          .lp-hero h1{font-size:1.9rem}
          .lp-hero-stats{gap:18px;flex-wrap:wrap}
          .lp-steps-grid{grid-template-columns:1fr}
          .lp-fgrid{grid-template-columns:1fr}
          .lp-section{padding:70px 0}
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="lp-navbar">
        <div className="lp-container lp-nav-wrap">
          <a href="#" className="lp-logo">
            <div className="lp-logo-icon">⚡</div>BotFlow
          </a>
          <ul className="lp-nav-links">
            <li><a href="#features">Возможности</a></li>
            <li><a href="#how">Как работает</a></li>
            <li><a href="#pricing">Тарифы</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="lp-btn lp-btn-outline" onClick={onLogin}>Войти</button>
            <button className="lp-btn lp-btn-primary" onClick={onRegister}>Начать бесплатно</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-badge">Новое: интеграция с VK AI</div>
              <h1>Создавайте чат-ботов для <span className="lp-grad-text">ВКонтакте</span> без кода</h1>
              <p className="lp-hero-sub">SaaS-платформа для разработки умных ботов с визуальным конструктором, готовыми сценариями и полной интеграцией VK API. Запуск за 15 минут.</p>
              <div className="lp-hero-cta">
                <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onRegister}>Начать бесплатно →</button>
              </div>
              <div className="lp-hero-stats">
                {[["12K+","Активных ботов"],["98%","Uptime"],["4.9★","Оценка клиентов"]].map(([v,l])=>(
                  <div key={l}><div className="lp-stat-val">{v}</div><div className="lp-stat-lbl">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="lp-visual">
              <img
                src="https://cdn.poehali.dev/projects/ef9ccef5-4bd7-4fe3-81e1-400d70465a9f/bucket/ee29efca-c219-44b8-b79f-d4ec6f440890.png"
                alt="Конструктор чат-ботов для ВКонтакте"
                className="lp-hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="lp-trust">
        <div className="lp-container">
          <div className="lp-trust-ttl">Нам доверяют более 3000 компаний</div>
          <div className="lp-trust-logos">
            {["SHOP.RU","MEGA STORE","TECH PRO","FOOD DELIVERY","EDU PLATFORM"].map((l)=>(
              <div key={l} className="lp-trust-logo">{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section lp-features-bg">
        <div className="lp-container">
          <div className="lp-sec-hdr">
            <div className="lp-tag">Возможности</div>
            <h2 className="lp-sec-title">Всё, что нужно для бота мечты</h2>
          </div>
          <div className="lp-feat-grid">
            {[
              {cls:"fi-b",ic:"🎨",t:"Визуальный конструктор",d:"Создавайте сценарии перетаскиванием блоков без единой строки кода."},
              {cls:"fi-p",ic:"🤖",t:"Интеграция с GPT",d:"Подключите нейросети для умных ответов — бот понимает контекст."},
              {cls:"fi-g",ic:"📊",t:"Аналитика в реальном времени",d:"Конверсии, популярные сценарии и поведение пользователей на дашборде."},
              {cls:"fi-o",ic:"🔗",t:"CRM и внешние API",d:"Bitrix24, AmoCRM, Google Sheets, 1C и любые REST API."},
              {cls:"fi-pk",ic:"👥",t:"Передача оператору",d:"Автоматическая эскалация сложных запросов живому менеджеру."},
              {cls:"fi-c",ic:"🛡️",t:"Безопасность и 152-ФЗ",d:"Шифрование данных, резервные копии, серверы в России."},
            ].map((f)=>(
              <div key={f.t} className="lp-feat-card anim-card">
                <div className={`lp-feat-icon ${f.cls}`}>{f.ic}</div>
                <h3>{f.t}</h3><p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="lp-section lp-steps-bg">
        <div className="lp-container">
          <div className="lp-sec-hdr">
            <div className="lp-tag">Как это работает</div>
            <h2 className="lp-sec-title">Запустите бота за 4 шага</h2>
            <p className="lp-sec-sub">От регистрации до первого диалога — 15 минут</p>
          </div>
          <div className="lp-steps-grid">
            {[
              {n:"1",t:"Регистрация",d:"Создайте аккаунт и подключите сообщество ВКонтакте в один клик"},
              {n:"2",t:"Выберите шаблон",d:"Используйте готовый шаблон или создайте сценарий с нуля"},
              {n:"3",t:"Настройте логику",d:"Добавьте ответы, кнопки, условия через drag-and-drop конструктор"},
              {n:"4",t:"Запустите",d:"Активируйте бота и наблюдайте, как он работает 24/7"},
            ].map((s)=>(
              <div key={s.n} className="lp-step anim-card">
                <div className="lp-step-num">{s.n}</div>
                <h3>{s.t}</h3><p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section lp-pricing-bg">
        <div className="lp-container">
          <div className="lp-sec-hdr">
            <div className="lp-tag">Тарифы</div>
            <h2 className="lp-sec-title">Прозрачные цены</h2>
            <p className="lp-sec-sub">Начните бесплатно и масштабируйтесь по мере роста</p>
          </div>
          <div className="lp-ptoggle">
            <span className="toggle-label active" data-period="month">Ежемесячно</span>
            <div className="toggle-switch" id="pricingToggle"/>
            <span className="toggle-label" data-period="year">Ежегодно</span>
            <span className="save-badge">-20%</span>
          </div>
          <div className="lp-pgrid">
            {[
              {name:"Старт",desc:"Для тестирования",pm:"0",py:"0",per:"навсегда бесплатно",feats:["До 100 диалогов","1 бот","Базовый конструктор","Шаблоны","Email-поддержка"],dis:["CRM-интеграции","AI-ответы"],btnTxt:"Начать бесплатно",btnCls:"lp-btn-outline"},
              {name:"Бизнес",desc:"Для растущих компаний",pm:"1990",py:"1590",per:"в месяц",feats:["До 10 000 диалогов","До 5 ботов","Конструктор Pro","CRM-интеграция","GPT (1000 запросов)","Аналитика","Приоритетная поддержка"],dis:[],btnTxt:"Выбрать тариф",btnCls:"lp-btn-primary",featured:true},
              {name:"Премиум",desc:"Для крупных проектов",pm:"7990",py:"6390",per:"в месяц",feats:["Безлимитные диалоги","Безлимитные боты","White-label","Все CRM","GPT без ограничений","API доступ","Персональный менеджер"],dis:[],btnTxt:"Связаться",btnCls:"lp-btn-outline"},
            ].map((p)=>(
              <div key={p.name} className={`lp-pcard anim-card${p.featured?" featured":""}`}>
                {p.featured && <div className="pop-badge">Популярный</div>}
                <div className="plan-name">{p.name}</div>
                <p className="plan-desc">{p.desc}</p>
                <div className="plan-price">
                  <span className="price-amount" data-month={p.pm} data-year={p.py}>{Number(p.pm).toLocaleString("ru-RU")}</span>
                  <span className="price-cur">₽</span>
                </div>
                <div className="price-per">{p.per}</div>
                <ul className="plan-feats">
                  {p.feats.map((f)=><li key={f}>{f}</li>)}
                  {p.dis.map((f)=><li key={f} className="dis">{f}</li>)}
                </ul>
                <button className={`lp-btn ${p.btnCls}`} onClick={p.featured ? onRegister : undefined}>{p.btnTxt}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-faq-bg">
        <div className="lp-container">
          <div className="lp-sec-hdr">
            <div className="lp-tag">FAQ</div>
            <h2 className="lp-sec-title">Частые вопросы</h2>
            <p className="lp-sec-sub">Не нашли ответ? Напишите нам</p>
          </div>
          <div className="lp-faq-list">
            {[
              {q:"Нужны ли навыки программирования?",a:"Нет. Визуальный конструктор позволяет собирать сценарии перетаскиванием блоков. Для продвинутых — кастомные скрипты на JavaScript."},
              {q:"Как подключить сообщество ВКонтакте?",a:"2 минуты: нажмите «Подключить VK» в кабинете, авторизуйтесь, выберите сообщество. Callback API настраивается автоматически."},
              {q:"Есть ли ограничения на бесплатном тарифе?",a:"До 100 диалогов в месяц, 1 бот, базовые функции конструктора. Достаточно для тестирования."},
              {q:"Где хранятся данные пользователей?",a:"На серверах в России согласно 152-ФЗ. Шифрование AES-256, ежедневные бэкапы."},
              {q:"Можно ли отменить подписку?",a:"Да, в один клик в личном кабинете. Доступ сохранится до конца оплаченного периода."},
            ].map((item)=>(
              <div key={item.q} className="faq-item">
                <div className="faq-q"><span>{item.q}</span><div className="faq-icon">+</div></div>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-container">
          <div className="lp-cta-inner">
            <h2>Готовы автоматизировать общение с клиентами?</h2>
            <p>Присоединяйтесь к 12 000+ компаниям, которые уже используют BotFlow</p>
            <div className="lp-cta-btns">
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onRegister}>Создать бота бесплатно →</button>
              <a href="#how" className="lp-btn lp-btn-outline lp-btn-lg">Записаться на демо</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-fgrid">
            <div className="lp-fbrand">
              <a href="#" className="lp-flogo"><div className="lp-logo-icon">⚡</div>BotFlow</a>
              <p>SaaS-платформа для создания умных чат-ботов ВКонтакте без кода.</p>
            </div>
            {[
              {t:"Продукт",ls:["Возможности","Тарифы","Интеграции","Шаблоны","API"]},
              {t:"Компания",ls:["О нас","Блог","Карьера","Контакты","Партнёрам"]},
              {t:"Поддержка",ls:["Документация","База знаний","Статус","Обучение","Связаться"]},
            ].map((col)=>(
              <div key={col.t} className="lp-fcol">
                <h4>{col.t}</h4>
                <ul>{col.ls.map((l)=><li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="lp-fbot">
            <div>© 2026 BotFlow. Все права защищены.</div>
            <div className="lp-socials">
              {["VK","TG","YT","GH"].map((s)=><a key={s} href="#" className="lp-social">{s}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}