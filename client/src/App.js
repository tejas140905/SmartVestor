import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ children }) {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-200">
			<nav className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800">
				<div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
					<Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">SmartVestor India 🇮🇳</Link>
					<div className="space-x-4 text-sm">
						<Link to="/" className="hover:text-white/90">Home</Link>
						<Link to="/plan" className="hover:text-white/90">Your Plan</Link>
						<Link to="/dashboard" className="hover:text-white/90">Dashboard</Link>
						<Link to="/ai-assistant" className="hover:text-white/90 flex items-center space-x-1">
							<span>🤖</span>
							<span>AI Assistant</span>
						</Link>
					</div>
				</div>
			</nav>
			<main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
			<footer className="text-center text-xs text-slate-500 py-6">© {new Date().getFullYear()} SmartVestor India • Invest wisely for India 🇮🇳</footer>
		</div>
	);
}

function Home() {
	return (
		<div className="space-y-10">
		<section className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-neutral-900 to-black text-white ring-1 ring-white/10">
				<div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
				<div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
				<div className="relative px-6 py-12 md:px-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium ring-1 ring-white/10">🇮🇳 Made for India • AI-Powered • SEBI Compliant</div>
						<h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Invest smarter for India with your personal AI agent</h1>
						<p className="text-white/80">SmartVestor suggests a clear, diversified plan across Indian stocks, mutual funds, ETFs, crypto, and real estate—based on your goals and risk appetite. Get recommendations in Hindi, English, or Hinglish!</p>
						<div className="flex flex-wrap gap-3">
							<Link to="/plan" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white px-5 py-2.5 rounded-md font-medium shadow-sm">Get started <span>→</span></Link>
							<Link to="/ai-assistant" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-md font-medium ring-1 ring-white/10">🤖 Ask AI Assistant</Link>
							<a href="#how" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-md font-medium ring-1 ring-white/10">How it works</a>
						</div>
					</div>
					<div className="hidden md:block">
						<div className="rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 shadow-lg">
							<div className="text-sm text-white/80">Preview</div>
							<div className="mt-2 text-2xl font-semibold">Your Indian investment plan</div>
							<ul className="mt-3 text-sm list-disc pl-5 space-y-1 text-white/80">
								<li>Nifty 50 Stocks • Indian Mutual Funds • ETFs</li>
								<li>ELSS Tax Saving • Crypto (Indian exchanges) • REITs</li>
								<li>SEBI compliant • Tax implications included</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section id="how" className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[
					{ t: 'Tell us about you', d: 'Indian financial goals, monthly budget, risk appetite.', i: '📝' },
					{ t: 'Get Indian recommendations', d: 'Personalized mix across Indian assets and platforms.', i: '📈' },
					{ t: 'Stay on track', d: 'SIP tips, tax benefits, and steady investing.', i: '⏱️' }
				].map((f, i) => (
					<div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm hover:shadow-md transition">
						<div className="text-2xl">{f.i}</div>
						<div className="font-semibold mt-1 text-white">{f.t}</div>
						<div className="text-sm text-slate-400">{f.d}</div>
					</div>
				))}
			</section>
		</div>
	);
}

function PlanForm() {
	const navigate = useNavigate();
	const [goals, setGoals] = useState('Children education, home purchase, retirement planning');
	const [budget, setBudget] = useState('10000');
const [risk, setRisk] = useState('medium');
const [currency, setCurrency] = useState('INR');
const [language, setLanguage] = useState('hinglish');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
            const res = await fetch('/api/recommend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goals, budget, risk, currency, language })
			});
			if (!res.ok) throw new Error('Failed to get recommendations');
			const data = await res.json();
			navigate('/recommendations', { state: data });
		} catch (err) {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Tell us about your goals</h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-800">
				<div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Financial goals</label>
                    <textarea value={goals} onChange={e => setGoals(e.target.value)} className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" rows={3} placeholder="E.g., children education, home purchase, marriage, retirement planning, emergency fund" />
				</div>
				<div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Monthly investable budget (INR)</label>
                    <input value={budget} onChange={e => setBudget(e.target.value)} type="number" min="0" className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="10000" />
				</div>
				<div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Risk appetite</label>
                    <select value={risk} onChange={e => setRisk(e.target.value)} className="w-full rounded-md bg-slate-950 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2">
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Investment currency</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-md bg-slate-950 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2">
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-md bg-slate-950 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2">
                        <option value="hinglish">Hinglish (Recommended for India)</option>
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="en">English</option>
                    </select>
                </div>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white px-4 py-2 rounded-md disabled:opacity-60">
					{loading ? 'Thinking…' : 'Get recommendations'}
				</button>
			</form>
		</div>
	);
}

function Recommendations() {
	const { state } = useLocation();
	const data = state || {};
	const advice = data.advice || {};
	const rec = advice.recommendations || {};

	async function savePlan() {
		const token = localStorage.getItem('sv_token');
		if (!token) return alert('Please login to save plans.');
		await fetch('/api/plans', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ title: `Plan ${new Date().toLocaleString()}`, record: data })
		});
		alert('Plan saved');
	}

	async function exportPdf() {
		const el = document.getElementById('recommendation-root');
		if (!el) return;
		const { default: html2canvas } = await import('html2canvas');
		const { jsPDF } = await import('jspdf');
		const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const imgWidth = pageWidth;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		let y = 0;
		if (imgHeight < pageHeight) {
			pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
		} else {
			let remaining = imgHeight;
			while (remaining > 0) {
				pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
				remaining -= pageHeight;
				if (remaining > 0) { pdf.addPage(); y -= pageHeight; }
			}
		}
		pdf.save('SmartVestor-India-Plan.pdf');
	}

	function shareEmail() {
		const subject = encodeURIComponent('My SmartVestor India Investment Plan');
		const body = encodeURIComponent(`Budget: ${advice.currencySymbol || '₹'}${advice.inputs?.monthlyBudget}\nRisk: ${advice.inputs?.risk}\nExpected returns: ${advice.expectedReturns}\n\nGenerated by SmartVestor India 🇮🇳`);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	}

	function shareWhatsApp() {
		const text = encodeURIComponent(`My SmartVestor India Investment Plan 🇮🇳\nBudget: ${advice.currencySymbol || '₹'}${advice.inputs?.monthlyBudget}\nRisk: ${advice.inputs?.risk}\nExpected returns: ${advice.expectedReturns}\n\nGenerated by SmartVestor India`);
		window.open(`https://wa.me/?text=${text}`, '_blank');
	}

	return (
		<div className="space-y-6" id="recommendation-root">
			<h2 className="text-3xl font-bold">Your personalized recommendations</h2>
			<div className="grid md:grid-cols-2 gap-4">
				<Card title="Overview">
                    <div className="text-sm text-slate-700">Expected returns: <b>{advice.expectedReturns}</b></div>
                    <div className="text-sm text-slate-700">Monthly budget: <b>{advice.currencySymbol || '₹'}{advice.inputs?.monthlyBudget || 0}</b> • Currency: <b>{advice.currency || 'INR'}</b> • Risk: <b className="uppercase">{advice.inputs?.risk}</b></div>
				</Card>
				<Card title="Diversification tips">
					<ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
						{(advice.diversificationTips || []).map((t, i) => <li key={i}>{t}</li>)}
					</ul>
				</Card>
			</div>
			{advice.regulatoryInfo && (
				<Card title="🇮🇳 Indian Regulatory Information">
					<div className="space-y-2 text-sm text-slate-700">
						<div><strong>SEBI:</strong> {advice.regulatoryInfo.sebi}</div>
						<div><strong>KYC:</strong> {advice.regulatoryInfo.kyc}</div>
						<div><strong>Tax:</strong> {advice.regulatoryInfo.tax}</div>
						<div className="text-xs text-slate-500 mt-2"><strong>Disclaimer:</strong> {advice.regulatoryInfo.disclaimer}</div>
					</div>
				</Card>
			)}
			<div className="flex flex-wrap gap-3">
				<button onClick={savePlan} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">Save Plan</button>
				<button onClick={exportPdf} className="bg-slate-900 border border-slate-300 px-4 py-2 rounded-md">Export PDF</button>
				<button onClick={shareEmail} className="bg-slate-900 border border-slate-300 px-4 py-2 rounded-md">Share via Email</button>
				<button onClick={shareWhatsApp} className="bg-slate-900 border border-slate-300 px-4 py-2 rounded-md">Share on WhatsApp</button>
			</div>
			<div className="space-y-6">
                <DetailedRecCard name="📈 Stocks" item={rec.stocks} sym={advice.currencySymbol} />
                <DetailedRecCard name="🏦 Mutual Funds" item={rec.mutualFunds} sym={advice.currencySymbol} />
                <DetailedRecCard name="📊 ETFs" item={rec.etfs} sym={advice.currencySymbol} />
                <DetailedRecCard name="₿ Crypto" item={rec.crypto} sym={advice.currencySymbol} />
                <DetailedRecCard name="🏠 Real Estate" item={rec.realEstate} sym={advice.currencySymbol} />
			</div>
			
			{/* Platform Comparison Table */}
			<Card title="🏆 Indian Investment Platforms Comparison">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b">
								<th className="text-left py-2">Platform</th>
								<th className="text-left py-2">Stocks</th>
								<th className="text-left py-2">Mutual Funds</th>
								<th className="text-left py-2">ETFs</th>
								<th className="text-left py-2">Crypto</th>
								<th className="text-left py-2">Fees</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="py-2 font-medium">Zerodha</td>
								<td className="py-2">✅ ₹20/order</td>
								<td className="py-2">✅ Coin</td>
								<td className="py-2">✅</td>
								<td className="py-2">❌</td>
								<td className="py-2">Low</td>
							</tr>
							<tr className="border-b">
								<td className="py-2 font-medium">Groww</td>
								<td className="py-2">✅ ₹0</td>
								<td className="py-2">✅</td>
								<td className="py-2">✅</td>
								<td className="py-2">❌</td>
								<td className="py-2">Free</td>
							</tr>
							<tr className="border-b">
								<td className="py-2 font-medium">Upstox</td>
								<td className="py-2">✅ ₹20/order</td>
								<td className="py-2">✅</td>
								<td className="py-2">✅</td>
								<td className="py-2">❌</td>
								<td className="py-2">Low</td>
							</tr>
							<tr className="border-b">
								<td className="py-2 font-medium">WazirX</td>
								<td className="py-2">❌</td>
								<td className="py-2">❌</td>
								<td className="py-2">❌</td>
								<td className="py-2">✅</td>
								<td className="py-2">0.1%</td>
							</tr>
							<tr>
								<td className="py-2 font-medium">CoinDCX</td>
								<td className="py-2">❌</td>
								<td className="py-2">❌</td>
								<td className="py-2">❌</td>
								<td className="py-2">✅</td>
								<td className="py-2">0.1%</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}

function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('sv_token');
        if (!token) { setLoading(false); return; }
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }})
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setUser(data.user))
            .finally(() => setLoading(false));
    }, []);
    return { user, setUser, loading };
}

function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    async function googleDemo() {
        setError('');
        try {
            const res = await fetch('/api/auth/google-demo', { method: 'POST' });
            if (!res.ok) throw new Error('Google sign-in failed');
            const data = await res.json();
            localStorage.setItem('sv_token', data.token);
            nav('/dashboard');
        } catch (e) { setError('Google sign-in failed'); }
    }
    async function onSubmit(e) {
        e.preventDefault(); setError('');
        try {
            const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            if (!res.ok) throw new Error('Login failed');
            const data = await res.json();
            localStorage.setItem('sv_token', data.token);
            nav('/dashboard');
        } catch (e) { setError('Invalid credentials'); }
    }
    return (
        <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={onSubmit} className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <input className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input type="password" className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white px-4 py-2 rounded-md w-full">Login</button>
            </form>
            <div className="text-sm mt-2">No account? <Link to="/register" className="text-indigo-400">Register</Link></div>
            <div className="mt-4">
                <button onClick={googleDemo} className="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-md font-medium border">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.303,6.053,28.884,4,24,4C12.954,4,4,12.954,4,24s8.954,20,20,20 s20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.303,6.053,28.884,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.191-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.274-7.952 l-6.488,5C10.7,39.556,16.782,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.215-4.099,5.691c0.001-0.001,0.001-0.001,0.002-0.002 L37.409,38.808C33.861,42.023,29.166,44,24,44c-7.218,0-13.355-4.115-16.762-10.152l6.488-5C15.381,32.683,18.798,35,24,35 c5.223,0,9.655-3.343,11.303-8H24v-8h19.611C43.862,21.35,44,22.659,44,24c0,1.341-0.138,2.651-0.389,3.917 c0.001-0.001,0.001-0.001,0.002-0.002l0,0C43.613,27.922,44,25.999,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                    Continue with Google
                </button>
                <div className="text-xs text-slate-400 mt-1 text-center">Demo sign-in (no OAuth)</div>
            </div>
        </div>
    );
}

function Register() {
    const nav = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    async function googleDemo() {
        setError('');
        try {
            const res = await fetch('/api/auth/google-demo', { method: 'POST' });
            if (!res.ok) throw new Error('Google sign-in failed');
            const data = await res.json();
            localStorage.setItem('sv_token', data.token);
            nav('/dashboard');
        } catch (e) { setError('Google sign-in failed'); }
    }
    async function onSubmit(e) {
        e.preventDefault(); setError('');
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
            if (!res.ok) throw new Error('Register failed');
            const data = await res.json();
            localStorage.setItem('sv_token', data.token);
            nav('/dashboard');
        } catch (e) { setError('Registration failed'); }
    }
    return (
        <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4">Create account</h2>
            <form onSubmit={onSubmit} className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <input className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
                <input className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input type="password" className="w-full rounded-md bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button className="bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white px-4 py-2 rounded-md w-full">Register</button>
            </form>
            <div className="mt-4">
                <button onClick={googleDemo} className="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-md font-medium border">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.303,6.053,28.884,4,24,4C12.954,4,4,12.954,4,24s8.954,20,20,20 s20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.303,6.053,28.884,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.191-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.274-7.952 l-6.488,5C10.7,39.556,16.782,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.215-4.099,5.691c0.001-0.001,0.001-0.001,0.002-0.002 L37.409,38.808C33.861,42.023,29.166,44,24,44c-7.218,0-13.355-4.115-16.762-10.152l6.488-5C15.381,32.683,18.798,35,24,35 c5.223,0,9.655-3.343,11.303-8H24v-8h19.611C43.862,21.35,44,22.659,44,24c0,1.341-0.138,2.651-0.389,3.917 c0.001-0.001,0.001-0.001,0.002-0.002l0,0C43.613,27.922,44,25.999,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                    Continue with Google
                </button>
                <div className="text-xs text-slate-400 mt-1 text-center">Demo sign-in (no OAuth)</div>
            </div>
        </div>
    );
}

function Dashboard() {
    const nav = useNavigate();
    const { user, loading } = useAuth();
    const [plans, setPlans] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('sv_token');
        if (!token) return;
        fetch('/api/plans', { headers: { Authorization: `Bearer ${token}` }})
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setPlans(data.plans || []));
    }, []);
    if (loading) return <div>Loading…</div>;
    if (!user) return <div className="max-w-sm mx-auto">Please <Link to="/login" className="text-indigo-600">login</Link>.</div>;
    return (
        <div className="space-y-3">
            <div className="text-2xl font-bold">Welcome, {user.name || user.email}</div>
            <div className="text-sm text-slate-600">View and create new plans anytime.</div>
            <div className="flex gap-2">
                <Link to="/plan" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">Create a plan</Link>
                <button onClick={()=>{ localStorage.removeItem('sv_token'); nav('/'); }} className="border border-slate-300 px-4 py-2 rounded-md">Logout</button>
            </div>
            <div className="mt-4">
                <div className="font-semibold mb-2">Your saved plans</div>
                {plans.length === 0 && <div className="text-sm text-slate-500">No saved plans yet.</div>}
                <div className="grid md:grid-cols-2 gap-3">
                    {plans.map(p => (
                        <div key={p.id} className="rounded-lg border bg-white p-4">
                            <div className="font-medium">{p.title}</div>
                            <div className="text-xs text-slate-600">{new Date(p.createdAt).toLocaleString()}</div>
                            <div className="text-sm text-slate-700 mt-1">Budget: {p.record?.advice?.currencySymbol}{p.record?.advice?.inputs?.monthlyBudget} • Risk: {p.record?.advice?.inputs?.risk}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Card({ title, children }) {
	return (
		<div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
			<div className="font-semibold mb-2">{title}</div>
			<div>{children}</div>
		</div>
	);
}

function RecCard({ name, item, sym }) {
	if (!item) return null;
	return (
		<div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
			<div className="font-semibold">{name} • {sym || '₹'}{item.amount}</div>
			<div className="text-sm text-slate-700">Platforms: {(item.platforms || []).join(', ')}</div>
			<div className="text-sm text-slate-700">{item.markets ? 'Markets' : 'Locations'}: {(item.markets || item.locations || []).join(', ')}</div>
			<div className="text-sm text-slate-700">Fees: {item.fees}</div>
			<div className="text-sm text-slate-700">Recommended horizon: {item.horizon}</div>
			<div className="text-xs text-slate-500 mt-2">{item.note}</div>
			<div className="text-xs text-emerald-700 mt-1">Tip: {item.tip}</div>
		</div>
	);
}

function DetailedRecCard({ name, item, sym }) {
	const [isExpanded, setIsExpanded] = useState(false);
	
	if (!item) return null;
	
	return (
		<div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition">
			<div className="p-5">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="font-semibold text-lg">{name} • {sym || '₹'}{item.amount}</div>
						<div className="text-sm text-slate-700 mt-1">Platforms: {(item.platforms || []).join(', ')}</div>
						<div className="text-sm text-slate-700">{item.markets ? 'Markets' : 'Locations'}: {(item.markets || item.locations || []).join(', ')}</div>
						<div className="text-sm text-slate-700">Fees: {item.fees}</div>
						<div className="text-sm text-slate-700">Recommended horizon: {item.horizon}</div>
						<div className="text-xs text-slate-500 mt-2">{item.note}</div>
						<div className="text-xs text-emerald-700 mt-1">Tip: {item.tip}</div>
					</div>
					<button 
						onClick={() => setIsExpanded(!isExpanded)}
						className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200 transition"
					>
						{isExpanded ? 'Less Details' : 'More Details'}
					</button>
				</div>
			</div>
			
			{isExpanded && item.detailedInfo && (
				<div className="border-t bg-slate-50 p-5">
					<div className="space-y-4">
						{/* Step by Step Guide */}
						{item.detailedInfo.stepByStep && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-2">📋 Step-by-Step Guide:</h4>
								<div className="text-sm text-slate-700 bg-white p-3 rounded border">
									{item.detailedInfo.stepByStep}
								</div>
							</div>
						)}
						
						{/* Risk Level & Min Investment */}
						<div className="grid md:grid-cols-2 gap-4">
							{item.detailedInfo.riskLevel && (
								<div>
									<h4 className="font-semibold text-slate-800 mb-1">⚠️ Risk Level:</h4>
									<div className="text-sm text-slate-700">{item.detailedInfo.riskLevel}</div>
								</div>
							)}
							{item.detailedInfo.minInvestment && (
								<div>
									<h4 className="font-semibold text-slate-800 mb-1">💰 Min Investment:</h4>
									<div className="text-sm text-slate-700">{item.detailedInfo.minInvestment}</div>
								</div>
							)}
						</div>
						
						{/* Tax Benefits */}
						{item.detailedInfo.taxBenefits && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-1">🏛️ Tax Benefits:</h4>
								<div className="text-sm text-slate-700 bg-green-50 p-3 rounded border border-green-200">
									{item.detailedInfo.taxBenefits}
								</div>
							</div>
						)}
						
						{/* Advantages */}
						{item.detailedInfo.advantages && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-1">✅ Advantages:</h4>
								<div className="text-sm text-slate-700">{item.detailedInfo.advantages}</div>
							</div>
						)}
						
						{/* Tax Implications */}
						{item.detailedInfo.taxImplications && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-1">🏛️ Tax Implications:</h4>
								<div className="text-sm text-slate-700 bg-red-50 p-3 rounded border border-red-200">
									{item.detailedInfo.taxImplications}
								</div>
							</div>
						)}
						
						{/* Additional Costs */}
						{item.detailedInfo.additionalCosts && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-1">💰 Additional Costs:</h4>
								<div className="text-sm text-slate-700 bg-yellow-50 p-3 rounded border border-yellow-200">
									{item.detailedInfo.additionalCosts}
								</div>
							</div>
						)}
						
						{/* Recommended Funds/Stocks */}
						{item.detailedInfo.recommendedFunds && (
							<div>
								<h4 className="font-semibold text-slate-800 mb-2">📊 Recommended Options:</h4>
								<div className="space-y-2">
									{Array.isArray(item.detailedInfo.recommendedFunds) ? (
										// For ETFs
										item.detailedInfo.recommendedFunds.map((fund, idx) => (
											<div key={idx} className="bg-white p-3 rounded border text-sm">
												<div className="font-medium">{fund.name}</div>
												<div className="text-slate-600">Code: {fund.code} • Expense: {fund.expense} • Returns: {fund.returns}</div>
											</div>
										))
									) : (
										// For Mutual Funds and Stocks
										Object.entries(item.detailedInfo.recommendedFunds).map(([category, funds]) => (
											<div key={category} className="bg-white p-3 rounded border">
												<div className="font-medium text-slate-800 mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</div>
												<div className="space-y-1">
													{Array.isArray(funds) ? (
														funds.map((fund, idx) => (
															<div key={idx} className="text-sm text-slate-700">
																{typeof fund === 'string' ? fund : (
																	<div>
																		<div className="font-medium">{fund.name}</div>
																		<div className="text-slate-600">Code: {fund.code} • Expense: {fund.expense} • Returns: {fund.returns}</div>
																	</div>
																)}
															</div>
														))
													) : (
														<div className="text-sm text-slate-700">{funds}</div>
													)}
												</div>
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function AIAssistant() {
	const [messages, setMessages] = useState([
		{
			id: 1,
			type: 'ai',
			text: 'Namaste! Main aapka SmartVestor AI assistant hun! Main aapki investment questions ka answer de sakta hun. Aap kya janna chahte hain?',
			timestamp: new Date().toISOString()
		}
	]);
	const [inputText, setInputText] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [language, setLanguage] = useState('hinglish');

	const sendMessage = async () => {
		if (!inputText.trim()) return;
		
		const userMessage = {
			id: Date.now(),
			type: 'user',
			text: inputText,
			timestamp: new Date().toISOString()
		};
		
		setMessages(prev => [...prev, userMessage]);
		setInputText('');
		setIsLoading(true);
		
		try {
			const response = await fetch('/api/ai-assistant', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: inputText, language })
			});
			
			if (!response.ok) throw new Error('Failed to get AI response');
			
			const data = await response.json();
			
			const aiMessage = {
				id: Date.now() + 1,
				type: 'ai',
				text: data.answer,
				timestamp: data.timestamp
			};
			
			setMessages(prev => [...prev, aiMessage]);
		} catch (error) {
			const errorMessage = {
				id: Date.now() + 1,
				type: 'ai',
				text: 'Sorry, main abhi answer nahi de pa raha. Please try again.',
				timestamp: new Date().toISOString()
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white rounded-xl shadow-lg overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
								<span className="text-xl">🤖</span>
							</div>
							<div>
								<h2 className="text-xl font-bold">SmartVestor AI Assistant</h2>
								<p className="text-sm opacity-90">Your personal investment advisor</p>
							</div>
						</div>
						<select 
							value={language} 
							onChange={(e) => setLanguage(e.target.value)}
							className="bg-white/20 text-white border border-white/30 rounded px-3 py-1 text-sm"
						>
							<option value="hinglish">Hinglish</option>
							<option value="hi">हिंदी</option>
							<option value="en">English</option>
						</select>
					</div>
				</div>

				{/* Chat Messages */}
				<div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
					{messages.map((message) => (
						<div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
								message.type === 'user' 
									? 'bg-indigo-500 text-white' 
									: 'bg-white text-slate-800 border border-slate-200'
							}`}>
								<div className="text-sm">{message.text}</div>
								<div className={`text-xs mt-1 ${
									message.type === 'user' ? 'text-indigo-100' : 'text-slate-500'
								}`}>
									{new Date(message.timestamp).toLocaleTimeString()}
								</div>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-white text-slate-800 border border-slate-200 px-4 py-2 rounded-lg">
								<div className="flex items-center space-x-2">
									<div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
									<span className="text-sm">Thinking...</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Input Area */}
				<div className="p-4 bg-white border-t">
					<div className="flex space-x-2">
						<input
							type="text"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask me anything about investments..."
							className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							disabled={isLoading}
						/>
						<button
							onClick={sendMessage}
							disabled={isLoading || !inputText.trim()}
							className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Send
						</button>
					</div>
					<div className="mt-2 text-xs text-slate-500">
						💡 Try asking: "What is SIP?", "How to start investing?", "Best mutual funds in India?"
					</div>
					
					{/* Quick Question Suggestions */}
					<div className="mt-3">
						<div className="text-xs text-slate-500 mb-2">Quick questions:</div>
						<div className="flex flex-wrap gap-2">
							{[
								"What is SIP?",
								"How to start investing?",
								"Best mutual funds?",
								"Tax benefits?",
								"Risk management?",
								"Emergency fund?"
							].map((suggestion, index) => (
								<button
									key={index}
									onClick={() => setInputText(suggestion)}
									className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs transition"
								>
									{suggestion}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/plan" element={<PlanForm />} />
					<Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
