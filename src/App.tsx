import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Pricing toggle
    const toggle = document.getElementById("pricingToggle");
    const toggleLabels = document.querySelectorAll<HTMLElement>(".toggle-label");
    const priceAmounts = document.querySelectorAll<HTMLElement>(".price-amount");
    let isYearly = false;

    const handleToggle = () => {
      isYearly = !isYearly;
      toggle?.classList.toggle("active", isYearly);
      toggleLabels.forEach((label) => {
        const period = label.dataset.period;
        label.classList.toggle(
          "active",
          (period === "year" && isYearly) || (period === "month" && !isYearly)
        );
      });
      priceAmounts.forEach((amount) => {
        const value = isYearly ? amount.dataset.year : amount.dataset.month;
        amount.textContent = Number(value).toLocaleString("ru-RU");
      });
    };
    toggle?.addEventListener("click", handleToggle);

    // FAQ accordion
    const faqItems = document.querySelectorAll<HTMLElement>(".faq-item");
    const handleFaq = (item: HTMLElement) => () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach((i) => i.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    };
    const faqHandlers: Array<() => void> = [];
    faqItems.forEach((item) => {
      const h = handleFaq(item);
      faqHandlers.push(h);
      item.addEventListener("click", h);
    });

    // Navbar scroll
    const navbar = document.querySelector<HTMLElement>(".navbar");
    const handleScroll = () => {
      if (navbar) {
        navbar.style.boxShadow =
          window.scrollY > 20 ? "0 4px 20px rgba(0,0,0,0.06)" : "none";
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    document
      .querySelectorAll<HTMLElement>(
        ".feature-card, .step-card, .pricing-card, .testimonial-card"
      )
      .forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
      });

    return () => {
      toggle?.removeEventListener("click", handleToggle);
      faqItems.forEach((item, i) => item.removeEventListener("click", faqHandlers[i]));
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --primary: #0077FF;
          --primary-dark: #0056CC;
          --secondary: #7B61FF;
          --accent: #00D4AA;
          --dark: #0A0E27;
          --dark-2: #151935;
          --gray-900: #1A1F3A;
          --gray-700: #4A5280;
          --gray-500: #8B92B8;
          --gray-300: #C8CEE0;
          --gray-100: #F0F2F8;
          --white: #FFFFFF;
          --gradient: linear-gradient(135deg, #0077FF 0%, #7B61FF 100%);
          --gradient-2: linear-gradient(135deg, #00D4AA 0%, #0077FF 100%);
        }
        html { scroll-behavior: smooth; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
          line-height: 1.6;
          color: var(--dark);
          background: var(--white);
          overflow-x: hidden;
        }
        .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .nav-wrapper { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 1.4rem; font-weight: 800; color: var(--dark); text-decoration: none; }
        .logo-icon {
          width: 36px; height: 36px; background: var(--gradient); border-radius: 10px;
          display: flex; align-items: center; justify-content: center; color: white;
          font-size: 1.2rem; box-shadow: 0 8px 20px rgba(0,119,255,0.3);
        }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { color: var(--gray-700); text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .nav-links a:hover { color: var(--primary); }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 0.95rem;
          text-decoration: none; cursor: pointer; border: none; transition: all 0.3s ease; white-space: nowrap;
        }
        .btn-ghost { color: var(--gray-700); background: transparent; }
        .btn-ghost:hover { color: var(--primary); background: var(--gray-100); }
        .btn-primary { background: var(--gradient); color: white; box-shadow: 0 8px 20px rgba(0,119,255,0.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,119,255,0.4); }
        .btn-outline { background: white; color: var(--dark); border: 2px solid var(--gray-300); }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .btn-lg { padding: 16px 32px; font-size: 1.05rem; }

        /* HERO */
        .hero {
          padding: 140px 0 80px; position: relative; overflow: hidden;
          background: radial-gradient(ellipse at top, rgba(0,119,255,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at bottom right, rgba(123,97,255,0.08) 0%, transparent 60%);
        }
        .hero::before {
          content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(0,119,255,0.15) 0%, transparent 70%);
          filter: blur(60px); z-index: -1;
        }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
          background: rgba(0,119,255,0.1); color: var(--primary); border-radius: 100px;
          font-size: 0.85rem; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(0,119,255,0.2);
        }
        .hero-badge::before {
          content: ''; width: 8px; height: 8px; background: var(--accent);
          border-radius: 50%; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.3); } }
        .hero h1 { font-size: 3.75rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 24px; color: var(--dark); }
        .hero h1 .gradient-text { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-subtitle { font-size: 1.2rem; color: var(--gray-700); margin-bottom: 32px; max-width: 520px; }
        .hero-cta { display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; padding-top: 32px; border-top: 1px solid var(--gray-100); }
        .stat-value { font-size: 2rem; font-weight: 800; color: var(--dark); line-height: 1; }
        .stat-label { font-size: 0.85rem; color: var(--gray-500); margin-top: 4px; }

        /* Hero Visual */
        .hero-visual { position: relative; }
        .builder-mockup {
          background: white; border-radius: 20px;
          box-shadow: 0 40px 80px rgba(10,14,39,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden; position: relative;
        }
        .builder-header {
          background: var(--gray-100); padding: 12px 20px;
          display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .builder-dot { width: 12px; height: 12px; border-radius: 50%; background: #FF5F57; }
        .builder-dot:nth-child(2) { background: #FEBC2E; }
        .builder-dot:nth-child(3) { background: #28C840; }
        .builder-body {
          padding: 24px; min-height: 420px;
          background: linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%);
          position: relative;
          background-image: linear-gradient(rgba(0,119,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,119,255,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .flow-node {
          background: white; border-radius: 12px; padding: 14px 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: absolute;
          display: flex; align-items: center; gap: 10px;
          font-size: 0.9rem; font-weight: 600; border: 2px solid transparent;
        }
        .node-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .node-trigger { top: 30px; left: 30px; border-color: #00D4AA; animation: nodeFloat 3s ease-in-out infinite; }
        .node-trigger .node-icon { background: rgba(0,212,170,0.15); }
        .node-condition { top: 130px; left: 180px; border-color: #FFB800; animation: nodeFloat 3s ease-in-out infinite 0.5s; }
        .node-condition .node-icon { background: rgba(255,184,0,0.15); }
        .node-action { top: 230px; left: 60px; border-color: var(--primary); animation: nodeFloat 3s ease-in-out infinite 1s; }
        .node-action .node-icon { background: rgba(0,119,255,0.15); }
        .node-action-2 { top: 320px; left: 240px; border-color: var(--secondary); animation: nodeFloat 3s ease-in-out infinite 1.5s; }
        .node-action-2 .node-icon { background: rgba(123,97,255,0.15); }
        @keyframes nodeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .flow-line { position: absolute; stroke: var(--primary); stroke-width: 2; fill: none; stroke-dasharray: 6 4; animation: dash 20s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -100; } }
        .floating-card { position: absolute; background: white; border-radius: 16px; padding: 16px 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.12); display: flex; align-items: center; gap: 12px; }
        .floating-card-1 { top: -20px; right: -20px; animation: floatCard 4s ease-in-out infinite; }
        .floating-card-2 { bottom: 40px; left: -30px; animation: floatCard 4s ease-in-out infinite 1s; }
        @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .floating-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .floating-card-1 .floating-icon { background: rgba(0,212,170,0.15); }
        .floating-card-2 .floating-icon { background: rgba(123,97,255,0.15); }
        .floating-card-text strong { display: block; font-size: 0.9rem; color: var(--dark); }
        .floating-card-text span { font-size: 0.75rem; color: var(--gray-500); }

        /* TRUST BAR */
        .trust-bar { padding: 60px 0; background: var(--gray-100); }
        .trust-title { text-align: center; color: var(--gray-500); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 32px; }
        .trust-logos { display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 40px; }
        .trust-logo { font-size: 1.5rem; font-weight: 800; color: var(--gray-500); opacity: 0.7; transition: opacity 0.3s; }
        .trust-logo:hover { opacity: 1; color: var(--dark); }

        /* SECTIONS */
        section { padding: 100px 0; }
        .section-header { text-align: center; max-width: 700px; margin: 0 auto 60px; }
        .section-tag { display: inline-block; padding: 6px 14px; background: rgba(0,119,255,0.1); color: var(--primary); border-radius: 100px; font-size: 0.85rem; font-weight: 600; margin-bottom: 16px; }
        .section-title { font-size: 2.75rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--dark); }
        .section-subtitle { font-size: 1.15rem; color: var(--gray-700); }

        /* FEATURES */
        .features { background: white; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card {
          background: white; padding: 32px; border-radius: 20px;
          border: 1px solid var(--gray-100); transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--gradient); transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(10,14,39,0.08); border-color: transparent; }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 20px; }
        .feature-icon.blue { background: rgba(0,119,255,0.12); }
        .feature-icon.purple { background: rgba(123,97,255,0.12); }
        .feature-icon.green { background: rgba(0,212,170,0.12); }
        .feature-icon.orange { background: rgba(255,152,0,0.12); }
        .feature-icon.pink { background: rgba(255,64,129,0.12); }
        .feature-icon.cyan { background: rgba(0,188,212,0.12); }
        .feature-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 10px; color: var(--dark); }
        .feature-card p { color: var(--gray-700); font-size: 0.95rem; }

        /* HOW IT WORKS */
        .how-it-works { background: var(--gray-100); }
        .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; position: relative; }
        .step-card { background: white; padding: 32px 24px; border-radius: 20px; text-align: center; position: relative; transition: transform 0.3s; }
        .step-card:hover { transform: translateY(-4px); }
        .step-number { width: 48px; height: 48px; background: var(--gradient); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; margin: 0 auto 20px; box-shadow: 0 8px 20px rgba(0,119,255,0.3); }
        .step-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; color: var(--dark); }
        .step-card p { color: var(--gray-700); font-size: 0.9rem; }

        /* PRICING */
        .pricing { background: white; }
        .pricing-toggle { display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 50px; }
        .toggle-label { font-weight: 600; color: var(--gray-700); }
        .toggle-label.active { color: var(--dark); }
        .toggle-switch { position: relative; width: 56px; height: 30px; background: var(--gray-300); border-radius: 100px; cursor: pointer; transition: background 0.3s; }
        .toggle-switch.active { background: var(--gradient); }
        .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; background: white; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
        .toggle-switch.active::after { transform: translateX(26px); }
        .save-badge { background: rgba(0,212,170,0.15); color: #00A884; padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; }
        .pricing-card { background: white; border: 2px solid var(--gray-100); border-radius: 24px; padding: 40px 32px; position: relative; transition: all 0.3s; display: flex; flex-direction: column; }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(10,14,39,0.08); }
        .pricing-card.featured { background: var(--dark); color: white; border-color: var(--dark); transform: scale(1.03); box-shadow: 0 30px 60px rgba(10,14,39,0.2); }
        .pricing-card.featured:hover { transform: scale(1.03) translateY(-4px); }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--gradient); color: white; padding: 6px 16px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .plan-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: inherit; }
        .pricing-card.featured .plan-name { color: white; }
        .plan-desc { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 24px; }
        .pricing-card.featured .plan-desc { color: rgba(255,255,255,0.6); }
        .plan-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
        .price-amount { font-size: 3rem; font-weight: 800; line-height: 1; color: var(--dark); }
        .pricing-card.featured .price-amount { color: white; }
        .price-currency { font-size: 1.5rem; font-weight: 700; color: var(--dark); }
        .pricing-card.featured .price-currency { color: white; }
        .price-period { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 32px; }
        .pricing-card.featured .price-period { color: rgba(255,255,255,0.6); }
        .plan-features { list-style: none; margin-bottom: 32px; flex-grow: 1; }
        .plan-features li { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; font-size: 0.95rem; color: var(--gray-700); }
        .pricing-card.featured .plan-features li { color: rgba(255,255,255,0.85); }
        .plan-features li::before { content: '✓'; width: 20px; height: 20px; background: rgba(0,212,170,0.15); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; margin-top: 2px; }
        .plan-features li.disabled { opacity: 0.4; }
        .plan-features li.disabled::before { content: '—'; background: var(--gray-100); color: var(--gray-500); }
        .pricing-card .btn { width: 100%; }
        .pricing-card.featured .btn-primary { background: white; color: var(--dark); }
        .pricing-card.featured .btn-primary:hover { background: var(--gray-100); }

        /* TESTIMONIALS */
        .testimonials { background: var(--gray-100); }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .testimonial-card { background: white; padding: 32px; border-radius: 20px; position: relative; }
        .testimonial-stars { color: #FFB800; margin-bottom: 16px; font-size: 1.1rem; }
        .testimonial-text { color: var(--gray-700); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.7; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem; }
        .author-info strong { display: block; color: var(--dark); font-size: 0.95rem; }
        .author-info span { color: var(--gray-500); font-size: 0.85rem; }

        /* FAQ */
        .faq { background: white; }
        .faq-list { max-width: 800px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid var(--gray-100); padding: 24px 0; cursor: pointer; }
        .faq-question { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 600; color: var(--dark); }
        .faq-icon { width: 32px; height: 32px; background: var(--gray-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--primary); transition: all 0.3s; flex-shrink: 0; margin-left: 16px; }
        .faq-item.active .faq-icon { background: var(--primary); color: white; transform: rotate(45deg); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s ease; color: var(--gray-700); }
        .faq-item.active .faq-answer { max-height: 300px; padding-top: 16px; }

        /* CTA */
        .cta-section { padding: 100px 0; background: var(--dark); position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: -50%; left: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,119,255,0.3) 0%, transparent 70%); filter: blur(80px); }
        .cta-section::after { content: ''; position: absolute; bottom: -50%; right: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(123,97,255,0.3) 0%, transparent 70%); filter: blur(80px); }
        .cta-content { position: relative; z-index: 1; text-align: center; color: white; max-width: 700px; margin: 0 auto; }
        .cta-content h2 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; line-height: 1.1; }
        .cta-content p { font-size: 1.2rem; color: rgba(255,255,255,0.7); margin-bottom: 36px; }
        .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .cta-content .btn-primary { background: white; color: var(--dark); }
        .cta-content .btn-outline { background: transparent; color: white; border-color: rgba(255,255,255,0.3); }
        .cta-content .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: white; color: white; }

        /* FOOTER */
        footer { background: var(--dark-2); color: rgba(255,255,255,0.7); padding: 60px 0 30px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .footer-brand p { margin-top: 16px; font-size: 0.9rem; max-width: 320px; }
        .footer-logo { color: white; }
        .footer-col h4 { color: white; font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 10px; }
        .footer-col a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .footer-col a:hover { color: white; }
        .footer-bottom { padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; flex-wrap: wrap; gap: 16px; }
        .social-links { display: flex; gap: 12px; }
        .social-link { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: background 0.3s; }
        .social-link:hover { background: var(--primary); }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .hero h1 { font-size: 2.5rem; }
          .section-title { font-size: 2rem; }
          .features-grid, .pricing-grid, .testimonials-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .nav-links { display: none; }
          .pricing-card.featured { transform: scale(1); }
          .cta-content h2 { font-size: 2rem; }
        }
        @media (max-width: 568px) {
          .hero { padding: 110px 0 60px; }
          .hero h1 { font-size: 2rem; }
          .hero-stats { gap: 20px; flex-wrap: wrap; }
          .steps-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
          section { padding: 70px 0; }
          .nav-actions .btn-ghost { display: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-wrapper">
          <a href="#" className="logo">
            <div className="logo-icon">⚡</div>
            BotFlow
          </a>
          <ul className="nav-links">
            <li><a href="#features">Возможности</a></li>
            <li><a href="#how">Как работает</a></li>
            <li><a href="#pricing">Тарифы</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <div className="nav-actions">
            <a href="/Личный кабинет" className="btn btn-ghost">🏠 Личный кабинет</a>
            <a href="/login.php" className="btn btn-ghost">Войти</a>
            <a href="/register.php" className="btn btn-primary">Регистрация</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">Новое: интеграция с VK AI</div>
              <h1>Создавайте чат-ботов для <span className="gradient-text">ВКонтакте</span> без кода</h1>
              <p className="hero-subtitle">
                SaaS-платформа для разработки умных ботов с визуальным конструктором,
                готовыми сценариями и полной интеграцией VK API. Запуск за 15 минут.
              </p>
              <div className="hero-cta">
                <a href="#pricing" className="btn btn-primary btn-lg">Начать бесплатно →</a>
                <a href="#how" className="btn btn-outline btn-lg">▶ Смотреть демо</a>
              </div>
              <div className="hero-stats">
                <div><div className="stat-value">12K+</div><div className="stat-label">Активных ботов</div></div>
                <div><div className="stat-value">98%</div><div className="stat-label">Uptime</div></div>
                <div><div className="stat-value">4.9★</div><div className="stat-label">Оценка клиентов</div></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="builder-mockup">
                <div className="builder-header">
                  <div className="builder-dot" /><div className="builder-dot" /><div className="builder-dot" />
                </div>
                <div className="builder-body">
                  <svg className="flow-line" width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                    <path d="M 80 70 Q 150 100 220 150" />
                    <path d="M 260 190 Q 180 220 130 260" />
                    <path d="M 180 300 Q 240 310 290 340" />
                  </svg>
                  <div className="flow-node node-trigger"><div className="node-icon">💬</div><div>Сообщение</div></div>
                  <div className="flow-node node-condition"><div className="node-icon">🔀</div><div>Условие</div></div>
                  <div className="flow-node node-action"><div className="node-icon">📤</div><div>Отправить</div></div>
                  <div className="flow-node node-action-2"><div className="node-icon">🤖</div><div>AI-ответ</div></div>
                </div>
              </div>
              <div className="floating-card floating-card-1">
                <div className="floating-icon">✓</div>
                <div className="floating-card-text"><strong>+127 диалогов</strong><span>за последний час</span></div>
              </div>
              <div className="floating-card floating-card-2">
                <div className="floating-icon">⚡</div>
                <div className="floating-card-text"><strong>Ответ за 0.3с</strong><span>средняя скорость</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar" style={{ padding: "50px 0" }}>
        <div className="container">
          <div className="trust-title">Нам доверяют более 3000 компаний</div>
          <div className="trust-logos">
            {["SHOP.RU", "MEGA STORE", "TECH PRO", "FOOD DELIVERY", "EDU PLATFORM"].map((l) => (
              <div key={l} className="trust-logo">{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Возможности</div>
            <h2 className="section-title">Всё, что нужно для создания бота мечты</h2>
            <p className="section-subtitle">От простого автоответчика до сложной CRM-системы с AI — создавайте ботов любой сложности в одном месте</p>
          </div>
          <div className="features-grid">
            {[
              { cls: "blue", icon: "🎨", title: "Визуальный конструктор", desc: "Создавайте сценарии перетаскиванием блоков. Никакого кода — только логика и креатив." },
              { cls: "purple", icon: "🤖", title: "Интеграция с GPT и YandexGPT", desc: "Подключите нейросети для умных ответов. Бот будет понимать контекст и учиться." },
              { cls: "green", icon: "📊", title: "Аналитика в реальном времени", desc: "Отслеживайте конверсии, популярные сценарии и поведение пользователей на дашборде." },
              { cls: "orange", icon: "🔗", title: "CRM и внешние API", desc: "Интеграция с Bitrix24, AmoCRM, Google Sheets, 1C и любыми REST API." },
              { cls: "pink", icon: "👥", title: "Передача оператору", desc: "Автоматическая эскалация сложных запросов живому менеджеру с историей диалога." },
              { cls: "cyan", icon: "🛡️", title: "Безопасность и GDPR", desc: "Шифрование данных, резервные копии, соответствие требованиям законодательства РФ." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Как это работает</div>
            <h2 className="section-title">Запустите бота за 4 простых шага</h2>
            <p className="section-subtitle">От регистрации до первого диалога с клиентом — 15 минут</p>
          </div>
          <div className="steps-grid">
            {[
              { n: "1", title: "Регистрация", desc: "Создайте аккаунт и подключите сообщество ВКонтакте в один клик" },
              { n: "2", title: "Выберите шаблон", desc: "Используйте готовый шаблон или создайте сценарий с нуля в конструкторе" },
              { n: "3", title: "Настройте логику", desc: "Добавьте ответы, кнопки, условия и интеграции через drag-and-drop" },
              { n: "4", title: "Запустите", desc: "Активируйте бота и наблюдайте, как он обрабатывает диалоги 24/7" },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Тарифы</div>
            <h2 className="section-title">Прозрачные цены без скрытых платежей</h2>
            <p className="section-subtitle">Начните бесплатно и масштабируйтесь по мере роста бизнеса</p>
          </div>
          <div className="pricing-toggle">
            <span className="toggle-label active" data-period="month">Ежемесячно</span>
            <div className="toggle-switch" id="pricingToggle" />
            <span className="toggle-label" data-period="year">Ежегодно</span>
            <span className="save-badge">-20%</span>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-name">Старт</div>
              <p className="plan-desc">Для тестирования и небольших проектов</p>
              <div className="plan-price"><span className="price-amount" data-month="0" data-year="0">0</span><span className="price-currency">₽</span></div>
              <div className="price-period">навсегда бесплатно</div>
              <ul className="plan-features">
                <li>До 100 диалогов в месяц</li><li>1 бот</li><li>Базовый конструктор</li>
                <li>Шаблоны сценариев</li><li>Email-поддержка</li>
                <li className="disabled">Интеграция с CRM</li><li className="disabled">AI-ответы</li>
              </ul>
              <a href="#" className="btn btn-outline">Начать бесплатно</a>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Популярный</div>
              <div className="plan-name">Бизнес</div>
              <p className="plan-desc">Для растущих компаний и интернет-магазинов</p>
              <div className="plan-price"><span className="price-amount" data-month="2990" data-year="2390">2 990</span><span className="price-currency">₽</span></div>
              <div className="price-period">в месяц</div>
              <ul className="plan-features">
                <li>До 10 000 диалогов</li><li>До 5 ботов</li><li>Продвинутый конструктор</li>
                <li>Интеграция с CRM</li><li>GPT-интеграция (1000 запросов)</li>
                <li>Аналитика и отчёты</li><li>Приоритетная поддержка</li>
              </ul>
              <a href="#" className="btn btn-primary">Выбрать тариф</a>
            </div>
            <div className="pricing-card">
              <div className="plan-name">Премиум</div>
              <p className="plan-desc">Для крупных проектов и агентств</p>
              <div className="plan-price"><span className="price-amount" data-month="9990" data-year="7990">9 990</span><span className="price-currency">₽</span></div>
              <div className="price-period">в месяц</div>
              <ul className="plan-features">
                <li>Безлимитные диалоги</li><li>Безлимитные боты</li><li>White-label решение</li>
                <li>Все CRM-интеграции</li><li>GPT без ограничений</li>
                <li>API доступ</li><li>Персональный менеджер</li>
              </ul>
              <a href="#" className="btn btn-outline">Связаться с нами</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Отзывы</div>
            <h2 className="section-title">Что говорят наши клиенты</h2>
            <p className="section-subtitle">Более 3000 компаний уже автоматизировали общение с клиентами</p>
          </div>
          <div className="testimonials-grid">
            {[
              { init: "АК", name: "Анна Ковалёва", role: "Владелец магазина одежды", text: "Запустили бота для интернет-магазина за один вечер. Конверсия в покупку выросла на 34%, а нагрузка на поддержку снизилась вдвое." },
              { init: "ДМ", name: "Дмитрий Морозов", role: "Руководитель отдела продаж", text: "Интеграция с AmoCRM работает идеально. Все заявки автоматически попадают в воронку, менеджеры экономят по 3 часа в день на рутине." },
              { init: "ЕС", name: "Елена Смирнова", role: "Маркетолог, digital-агентство", text: "AI-функции — это магия. Бот отвечает так, будто это живой менеджер. Клиенты даже не понимают, что общаются с роботом." },
            ].map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.init}</div>
                  <div className="author-info"><strong>{t.name}</strong><span>{t.role}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">FAQ</div>
            <h2 className="section-title">Частые вопросы</h2>
            <p className="section-subtitle">Не нашли ответ? Напишите нам — поможем разобраться</p>
          </div>
          <div className="faq-list">
            {[
              { q: "Нужны ли навыки программирования?", a: "Нет, BotFlow создан для людей без технического бэкграунда. Визуальный конструктор позволяет собирать сценарии перетаскиванием блоков. Для продвинутых пользователей есть возможность писать кастомные скрипты на JavaScript." },
              { q: "Как подключить сообщество ВКонтакте?", a: "Процесс занимает 2 минуты. В личном кабинете нажмите «Подключить VK», авторизуйтесь и выберите сообщество. Мы автоматически настроим Callback API и все необходимые права доступа." },
              { q: "Есть ли ограничения на бесплатном тарифе?", a: "На бесплатном тарифе доступно до 100 диалогов в месяц, 1 бот и базовые функции конструктора. Этого достаточно, чтобы протестировать платформу и запустить небольшого бота для личного проекта." },
              { q: "Можно ли перенести данные с другой платформы?", a: "Да, мы поддерживаем импорт сценариев из SendPulse, Botpress, ManyChat и других популярных платформ. Наша команда поможет с миграцией на тарифах «Бизнес» и «Премиум»." },
              { q: "Где хранятся данные пользователей?", a: "Все данные хранятся на серверах в России в соответствии с 152-ФЗ. Мы используем шифрование AES-256, ежедневные бэкапы и соответствуем требованиям GDPR и российскому законодательству о персональных данных." },
              { q: "Можно ли отменить подписку в любой момент?", a: "Да, подписку можно отменить в один клик в личном кабинете. Доступ к платным функциям сохранится до конца оплаченного периода. Вы всегда можете экспортировать все данные в JSON или CSV." },
            ].map((item) => (
              <div key={item.q} className="faq-item">
                <div className="faq-question">
                  <span>{item.q}</span>
                  <div className="faq-icon">+</div>
                </div>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Готовы автоматизировать общение с клиентами?</h2>
            <p>Присоединяйтесь к 12 000+ компаниям, которые уже используют BotFlow для роста бизнеса</p>
            <div className="cta-buttons">
              <a href="#" className="btn btn-primary btn-lg">Создать бота бесплатно →</a>
              <a href="#" className="btn btn-outline btn-lg">Записаться на демо</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo footer-logo"><div className="logo-icon">⚡</div>BotFlow</a>
              <p>SaaS-платформа для создания умных чат-ботов ВКонтакте. Автоматизируйте общение с клиентами без кода.</p>
            </div>
            {[
              { title: "Продукт", links: ["Возможности", "Тарифы", "Интеграции", "Шаблоны", "API"] },
              { title: "Компания", links: ["О нас", "Блог", "Карьера", "Контакты", "Партнёрам"] },
              { title: "Поддержка", links: ["Документация", "База знаний", "Статус системы", "Обучение", "Связаться"] },
            ].map((col) => (
              <div key={col.title} className="footer-col">
                <h4>{col.title}</h4>
                <ul>{col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div>© 2026 BotFlow. Все права защищены.</div>
            <div className="social-links">
              {[["VK", "VK"], ["TG", "Telegram"], ["YT", "YouTube"], ["GH", "GitHub"]].map(([label, title]) => (
                <a key={label} href="#" className="social-link" title={title}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
