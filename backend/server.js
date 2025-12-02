const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'smartvestor.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_smartvestor_secret_change_me';

function ensureDb() {
	if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
	if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: [], users: [] }, null, 2));
}

function loadDb() {
	ensureDb();
	return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(db) {
	fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function generateToken(user) {
	return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

function generateAdvice(input) {
    const { goals = '', budget = 0, risk = 'medium', currency = 'USD', language = 'en' } = input || {};
	const monthlyBudget = Number(budget) || 0;
	const riskLevel = String(risk).toLowerCase();
	const currencyUpper = String(currency || 'USD').toUpperCase();
	const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
	const symbol = currencySymbols[currencyUpper] || '$';

	const mixByRisk = {
		low: { stocks: 0.25, mutualFunds: 0.35, etfs: 0.25, crypto: 0.0, realEstate: 0.15 },
		medium: { stocks: 0.35, mutualFunds: 0.30, etfs: 0.20, crypto: 0.05, realEstate: 0.10 },
		high: { stocks: 0.45, mutualFunds: 0.20, etfs: 0.15, crypto: 0.15, realEstate: 0.05 }
	};
	const mix = mixByRisk[riskLevel] || mixByRisk.medium;

	const allocations = Object.fromEntries(
		Object.entries(mix).map(([k, v]) => [k, Math.round(monthlyBudget * v)])
	);

	const platforms = {
		stocks: ['Zerodha', 'Groww', 'Upstox', 'Angel One', '5paisa'],
		mutualFunds: ['Groww', 'Zerodha Coin', 'Paytm Money', 'HDFC Securities', 'ICICI Direct'],
		etfs: ['Zerodha', 'Groww', 'Motilal Oswal', 'HDFC Securities', 'ICICI Direct'],
		crypto: ['WazirX', 'CoinDCX', 'ZebPay', 'Bitbns', 'Giottus'],
		realEstate: ['RealtyMogul India', 'Housing.com', 'Magicbricks', '99acres', 'PropTiger']
	};

	const marketsOrLocations = {
		stocks: ['Nifty 50', 'Nifty Next 50', 'Mid Cap Stocks', 'Small Cap Stocks'],
		mutualFunds: ['HDFC Top 100 Fund', 'SBI Bluechip Fund', 'ICICI Prudential Value Discovery', 'Axis Bluechip Fund'],
		etfs: ['Nifty 50 ETF', 'Sensex ETF', 'Bank Nifty ETF', 'Gold ETF'],
		crypto: ['BTC', 'ETH', 'BNB', 'MATIC'],
		realEstate: ['Mumbai Metro', 'Delhi NCR', 'Bangalore', 'Pune', 'Hyderabad']
	};

	// Detailed fund information for Indian market
	const detailedFunds = {
		stocks: {
			largeCap: ['Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'Hindustan Unilever'],
			midCap: ['Tata Motors', 'Bajaj Finance', 'Asian Paints', 'Maruti Suzuki', 'Bharti Airtel'],
			smallCap: ['IRCTC', 'Zomato', 'Paytm', 'Nykaa', 'PolicyBazaar']
		},
		mutualFunds: {
			largeCap: [
				{ name: 'HDFC Top 100 Fund', code: 'HDFC100', expense: '1.2%', returns: '12-15%' },
				{ name: 'SBI Bluechip Fund', code: 'SBIBC', expense: '1.1%', returns: '11-14%' },
				{ name: 'ICICI Prudential Bluechip Fund', code: 'ICICIBLUE', expense: '1.3%', returns: '12-15%' }
			],
			elss: [
				{ name: 'Axis Long Term Equity Fund', code: 'AXISELSS', expense: '1.2%', returns: '13-16%', lockin: '3 years' },
				{ name: 'HDFC TaxSaver Fund', code: 'HDFCTAX', expense: '1.1%', returns: '12-15%', lockin: '3 years' },
				{ name: 'SBI Magnum TaxGain Fund', code: 'SBITAX', expense: '1.0%', returns: '11-14%', lockin: '3 years' }
			],
			balanced: [
				{ name: 'HDFC Balanced Advantage Fund', code: 'HDFCBAL', expense: '1.4%', returns: '10-13%' },
				{ name: 'ICICI Prudential Balanced Advantage Fund', code: 'ICICIBAL', expense: '1.3%', returns: '10-12%' }
			]
		},
		etfs: [
			{ name: 'Nifty 50 ETF', code: 'NIFTYBEES', expense: '0.05%', returns: '10-12%' },
			{ name: 'Sensex ETF', code: 'SENSEXBEE', expense: '0.05%', returns: '10-12%' },
			{ name: 'Bank Nifty ETF', code: 'BANKBEES', expense: '0.05%', returns: '12-15%' },
			{ name: 'Gold ETF', code: 'GOLDBEES', expense: '0.1%', returns: '6-8%' }
		]
	};

	const fees = {
		stocks: '₹20 per order (Zerodha), ₹0 (Groww); STT and other charges apply.',
		mutualFunds: 'Expense ratios 0.5%-2.5%; ELSS funds have 3-year lock-in for tax benefits.',
		etfs: 'Expense ratios 0.1%-0.5%; lower than mutual funds; direct investment.',
		crypto: 'Trading fees 0.1%-0.5%; TDS 1% on profits; regulatory compliance required.',
		realEstate: 'Platform fees 0.5%-2%; stamp duty, registration charges apply.'
	};

	const horizon = {
		stocks: '5+ years for wealth creation; SIP in quality stocks recommended.',
		mutualFunds: '3-5+ years; ELSS funds have 3-year lock-in; SIP benefits.',
		etfs: '3-5+ years; lower expense ratios; track Nifty/Sensex indices.',
		crypto: 'Highly speculative; only for long-term, <5-10% of portfolio.',
		realEstate: 'Long-term 5-10 years; consider REITs for liquidity.'
	};

    const expectedReturns = {
        low: '6-8%/yr (FD, debt funds)',
        medium: '10-12%/yr (balanced portfolio)',
        high: '12-15%+/yr (equity-heavy, volatile)'
    }[riskLevel] || '10-12%/yr';

	const risks = {
		stocks: 'Market volatility; diversify across Nifty 50, mid-cap, small-cap.',
		mutualFunds: 'Fund performance risk; check expense ratios and fund manager track record.',
		etfs: 'Market risk; lower fees than MFs; track Nifty/Sensex indices.',
		crypto: 'High volatility; regulatory uncertainty; TDS implications; invest cautiously.',
		realEstate: 'Illiquidity; location-specific risks; stamp duty and registration costs.'
	};

    const lang = String(language).toLowerCase();
    const t = (en, hi, hin) => lang === 'hi' ? hi : lang === 'hinglish' ? hin : en;

    return {
        inputs: { goals, monthlyBudget, risk: riskLevel, language: lang },
		allocations,
			recommendations: {
            stocks: { 
                amount: allocations.stocks, 
                platforms: platforms.stocks, 
                markets: marketsOrLocations.stocks, 
                note: t(risks.stocks, 'बाज़ार अस्थिरता; निफ्टी 50, मिड-कैप, स्मॉल-कैप में विविधता रखें.', 'Market volatility; Nifty 50, mid-cap, small-cap me diversify karo.'), 
                fees: t(fees.stocks, '₹20 प्रति ऑर्डर (Zerodha), ₹0 (Groww); STT और अन्य शुल्क लागू.', '₹20 per order (Zerodha), ₹0 (Groww); STT aur other charges lagte hain.'), 
                horizon: t(horizon.stocks, '5+ साल धन निर्माण के लिए; गुणवत्ता वाले शेयरों में SIP करें.', '5+ saal wealth creation ke liye; quality stocks me SIP karo.'), 
                tip: t('Start with Nifty 50 stocks; add mid-cap and small-cap gradually.', 'निफ्टी 50 शेयरों से शुरू करें; धीरे-धीरे मिड-कैप और स्मॉल-कैप जोड़ें.', 'Nifty 50 stocks se start karo; dheere-dheere mid-cap aur small-cap add karo.'),
                detailedInfo: {
                    topStocks: detailedFunds.stocks,
                    stepByStep: t('1. Open demat account with Zerodha/Groww 2. Complete KYC 3. Start with Nifty 50 stocks 4. Add mid-cap gradually 5. Monitor quarterly', '1. Zerodha/Groww के साथ डीमैट खाता खोलें 2. KYC पूरा करें 3. निफ्टी 50 शेयरों से शुरू करें 4. धीरे-धीरे मिड-कैप जोड़ें 5. तिमाही निगरानी करें', '1. Zerodha/Groww ke saath demat account kholo 2. KYC complete karo 3. Nifty 50 stocks se start karo 4. Dheere-dheere mid-cap add karo 5. Quarterly monitor karo'),
                    riskLevel: t('Medium to High risk', 'मध्यम से उच्च जोखिम', 'Medium se high risk'),
                    minInvestment: t('₹500 per stock (minimum)', 'प्रति शेयर ₹500 (न्यूनतम)', 'Per stock ₹500 (minimum)')
                }
            },
            mutualFunds: { 
                amount: allocations.mutualFunds, 
                platforms: platforms.mutualFunds, 
                markets: marketsOrLocations.mutualFunds, 
                note: t(risks.mutualFunds, 'फंड प्रदर्शन जोखिम; खर्च अनुपात और फंड मैनेजर ट्रैक रिकॉर्ड देखें.', 'Fund performance risk; expense ratio aur fund manager track record check karo.'), 
                fees: t(fees.mutualFunds, 'खर्च अनुपात 0.5%-2.5%; ELSS फंड में 3 साल लॉक-इन टैक्स लाभ के लिए.', 'Expense ratio 0.5%-2.5%; ELSS funds me 3 saal lock-in tax benefits ke liye.'), 
                horizon: t(horizon.mutualFunds, '3-5+ साल; ELSS फंड में 3 साल लॉक-इन; SIP लाभ.', '3-5+ saal; ELSS funds me 3 saal lock-in; SIP benefits.'), 
                tip: t('Consider ELSS funds for tax benefits; SIP in large-cap and balanced funds.', 'टैक्स लाभ के लिए ELSS फंड पर विचार करें; लार्ज-कैप और बैलेंस्ड फंड में SIP.', 'Tax benefits ke liye ELSS funds consider karo; large-cap aur balanced funds me SIP.'),
                detailedInfo: {
                    recommendedFunds: detailedFunds.mutualFunds,
                    stepByStep: t('1. Complete KYC 2. Choose fund category (Large-cap/ELSS/Balanced) 3. Start SIP 4. Monitor performance 5. Rebalance annually', '1. KYC पूरा करें 2. फंड श्रेणी चुनें (लार्ज-कैप/ELSS/बैलेंस्ड) 3. SIP शुरू करें 4. प्रदर्शन निगरानी करें 5. सालाना रिबैलेंस करें', '1. KYC complete karo 2. Fund category choose karo (Large-cap/ELSS/Balanced) 3. SIP start karo 4. Performance monitor karo 5. Annually rebalance karo'),
                    riskLevel: t('Low to Medium risk', 'कम से मध्यम जोखिम', 'Low se medium risk'),
                    minInvestment: t('₹500 per month (SIP)', 'प्रति माह ₹500 (SIP)', 'Per month ₹500 (SIP)'),
                    taxBenefits: t('ELSS funds: ₹1.5L deduction under Section 80C', 'ELSS फंड: सेक्शन 80C के तहत ₹1.5L कटौती', 'ELSS funds: Section 80C ke tahat ₹1.5L deduction')
                }
            },
            etfs: { 
                amount: allocations.etfs, 
                platforms: platforms.etfs, 
                markets: marketsOrLocations.etfs, 
                note: t(risks.etfs, 'बाज़ार जोखिम; म्यूचुअल फंड से कम खर्च, निफ्टी/सेंसेक्स इंडेक्स ट्रैक करते हैं.', 'Market risk; mutual funds se kam fee, Nifty/Sensex index track karte hain.'), 
                fees: t(fees.etfs, 'खर्च अनुपात 0.1%-0.5%; म्यूचुअल फंड से कम; प्रत्यक्ष निवेश.', 'Expense ratio 0.1%-0.5%; mutual funds se kam; direct investment.'), 
                horizon: t(horizon.etfs, '3-5+ साल; कम खर्च अनुपात; निफ्टी/सेंसेक्स इंडेक्स ट्रैक करते हैं.', '3-5+ saal; kam expense ratio; Nifty/Sensex index track karte hain.'), 
                tip: t('Start with Nifty 50 and Sensex ETFs; add sector-specific ETFs later.', 'निफ्टी 50 और सेंसेक्स ETF से शुरू करें; बाद में सेक्टर-विशिष्ट ETF जोड़ें.', 'Nifty 50 aur Sensex ETF se start karo; baad me sector-specific ETF add karo.'),
                detailedInfo: {
                    recommendedETFs: detailedFunds.etfs,
                    stepByStep: t('1. Open demat account 2. Complete KYC 3. Start with Nifty 50 ETF 4. Add Sensex ETF 5. Consider sector ETFs', '1. डीमैट खाता खोलें 2. KYC पूरा करें 3. निफ्टी 50 ETF से शुरू करें 4. सेंसेक्स ETF जोड़ें 5. सेक्टर ETF पर विचार करें', '1. Demat account kholo 2. KYC complete karo 3. Nifty 50 ETF se start karo 4. Sensex ETF add karo 5. Sector ETF consider karo'),
                    riskLevel: t('Medium risk', 'मध्यम जोखिम', 'Medium risk'),
                    minInvestment: t('₹1 per unit (flexible)', 'प्रति यूनिट ₹1 (लचीला)', 'Per unit ₹1 (flexible)'),
                    advantages: t('Lower fees, real-time pricing, tax efficient', 'कम शुल्क, रियल-टाइम मूल्य, कर कुशल', 'Kam fees, real-time pricing, tax efficient')
                }
            },
            crypto: { 
                amount: allocations.crypto, 
                platforms: platforms.crypto, 
                markets: marketsOrLocations.crypto, 
                note: t(risks.crypto, 'उच्च अस्थिरता; विनियामक अनिश्चितता; TDS निहितार्थ; सावधानी से निवेश करें.', 'High volatility; regulatory uncertainty; TDS implications; invest cautiously.'), 
                fees: t(fees.crypto, 'ट्रेडिंग फीस 0.1%-0.5%; मुनाफे पर 1% TDS; विनियामक अनुपालन आवश्यक.', 'Trading fee 0.1%-0.5%; 1% TDS on profits; regulatory compliance required.'), 
                horizon: t(horizon.crypto, 'दीर्घकाल; पोर्टफोलियो में छोटा हिस्सा रखें (<5-10%).', 'Long-term; portfolio ka chhota part rakho (<5-10%).'), 
                tip: t('Use only Indian exchanges; keep small allocation; understand TDS implications.', 'केवल भारतीय एक्सचेंज का उपयोग करें; छोटा आवंटन रखें; TDS निहितार्थ समझें.', 'Sirf Indian exchanges use karo; chhota allocation rakho; TDS implications samjho.'),
                detailedInfo: {
                    stepByStep: t('1. Complete KYC on Indian exchange 2. Start with BTC/ETH 3. Keep allocation <5% 4. Understand TDS implications 5. Use hardware wallet for large amounts', '1. भारतीय एक्सचेंज पर KYC पूरा करें 2. BTC/ETH से शुरू करें 3. आवंटन <5% रखें 4. TDS निहितार्थ समझें 5. बड़ी रकम के लिए हार्डवेयर वॉलेट उपयोग करें', '1. Indian exchange pe KYC complete karo 2. BTC/ETH se start karo 3. Allocation <5% rakho 4. TDS implications samjho 5. Badi raqam ke liye hardware wallet use karo'),
                    riskLevel: t('Very High risk', 'बहुत उच्च जोखिम', 'Bahut high risk'),
                    minInvestment: t('₹100 (flexible)', '₹100 (लचीला)', '₹100 (flexible)'),
                    taxImplications: t('1% TDS on profits, 30% tax on gains, regulatory compliance required', 'मुनाफे पर 1% TDS, लाभ पर 30% कर, विनियामक अनुपालन आवश्यक', 'Munafe pe 1% TDS, labh pe 30% tax, regulatory compliance required')
                }
            },
            realEstate: { 
                amount: allocations.realEstate, 
                platforms: platforms.realEstate, 
                locations: marketsOrLocations.realEstate, 
                note: t(risks.realEstate, 'तरलता कम; स्थान-विशिष्ट जोखिम; स्टाम्प ड्यूटी और पंजीकरण लागत.', 'Illiquidity; location-specific risks; stamp duty aur registration costs.'), 
                fees: t(fees.realEstate, 'प्लेटफ़ॉर्म फीस 0.5%-2%; स्टाम्प ड्यूटी, पंजीकरण शुल्क लागू.', 'Platform fee 0.5%-2%; stamp duty, registration charges apply.'), 
                horizon: t(horizon.realEstate, 'दीर्घकाल 5-10 साल; तरलता के लिए REITs पर विचार करें.', 'Long-term 5-10 years; liquidity ke liye REITs consider karo.'), 
                tip: t('Consider REITs for liquidity; focus on metro cities; understand stamp duty implications.', 'तरलता के लिए REITs पर विचार करें; मेट्रो शहरों पर फोकस; स्टाम्प ड्यूटी निहितार्थ समझें.', 'Liquidity ke liye REITs consider karo; metro cities pe focus; stamp duty implications samjho.'),
                detailedInfo: {
                    stepByStep: t('1. Research metro cities 2. Consider REITs for liquidity 3. Understand stamp duty (5-7%) 4. Check rental yields 5. Plan for long-term hold', '1. मेट्रो शहरों का शोध करें 2. तरलता के लिए REITs पर विचार करें 3. स्टाम्प ड्यूटी (5-7%) समझें 4. किराया उपज जांचें 5. दीर्घकालिक होल्ड की योजना बनाएं', '1. Metro cities ka research karo 2. Liquidity ke liye REITs consider karo 3. Stamp duty (5-7%) samjho 4. Rental yields check karo 5. Long-term hold ki plan banao'),
                    riskLevel: t('Medium to High risk', 'मध्यम से उच्च जोखिम', 'Medium se high risk'),
                    minInvestment: t('₹10L+ (direct), ₹5K+ (REITs)', '₹10L+ (प्रत्यक्ष), ₹5K+ (REITs)', '₹10L+ (direct), ₹5K+ (REITs)'),
                    additionalCosts: t('Stamp duty 5-7%, Registration 1%, Brokerage 1-2%, Maintenance charges', 'स्टाम्प ड्यूटी 5-7%, पंजीकरण 1%, दलाली 1-2%, रखरखाव शुल्क', 'Stamp duty 5-7%, Registration 1%, Brokerage 1-2%, Maintenance charges')
                }
            }
		},
		expectedReturns,
		currency: currencyUpper,
		currencySymbol: symbol,
        diversificationTips: [
            t('Start SIP in mutual funds and ETFs for disciplined investing.', 'अनुशासित निवेश के लिए म्यूचुअल फंड और ETF में SIP शुरू करें.', 'Disciplined investing ke liye mutual funds aur ETF me SIP start karo.'),
            t('Maintain emergency fund (6-12 months expenses) in FD or liquid funds.', 'FD या लिक्विड फंड में आपातकालीन फंड (6-12 महीने) रखें.', 'FD ya liquid funds me emergency fund (6-12 months) rakho.'),
            t('Rebalance portfolio annually; consider tax implications.', 'पोर्टफोलियो को सालाना रिबैलेंस करें; टैक्स निहितार्थ पर विचार करें.', 'Portfolio ko annually rebalance karo; tax implications consider karo.'),
            t('Use ELSS funds for tax saving under Section 80C (₹1.5L limit).', 'सेक्शन 80C के तहत टैक्स सेविंग के लिए ELSS फंड का उपयोग करें (₹1.5L सीमा).', 'Section 80C ke tax saving ke liye ELSS funds use karo (₹1.5L limit).'),
            t('Consider PPF, EPF for long-term debt allocation.', 'दीर्घकालिक डेट आवंटन के लिए PPF, EPF पर विचार करें.', 'Long-term debt allocation ke liye PPF, EPF consider karo.')
        ],
        regulatoryInfo: {
            sebi: t('SEBI regulates all investment products in India. Always verify broker/fund registration.', 'भारत में सभी निवेश उत्पादों को SEBI नियंत्रित करता है। हमेशा ब्रोकर/फंड पंजीकरण सत्यापित करें।', 'India me sabhi investment products ko SEBI regulate karta hai. Hamesha broker/fund registration verify karo.'),
            kyc: t('KYC (Know Your Customer) is mandatory for all investments in India.', 'भारत में सभी निवेशों के लिए KYC (Know Your Customer) अनिवार्य है।', 'India me sabhi investments ke liye KYC (Know Your Customer) mandatory hai.'),
            tax: t('LTCG tax: 10% on gains >₹1L (equity), 20% with indexation (debt). STCG: 15% (equity).', 'LTCG टैक्स: ₹1L से अधिक लाभ पर 10% (इक्विटी), 20% इंडेक्सेशन के साथ (डेट)। STCG: 15% (इक्विटी)।', 'LTCG tax: ₹1L se zyada gains pe 10% (equity), 20% indexation ke saath (debt). STCG: 15% (equity).'),
            disclaimer: t('This is general advice. Consult a financial advisor for personalized recommendations.', 'यह सामान्य सलाह है। व्यक्तिगत सिफारिशों के लिए वित्तीय सलाहकार से सलाह लें।', 'Ye general advice hai. Personal recommendations ke liye financial advisor se consult karo.')
        }
	};
}

function generateAIResponse(question, language = 'hinglish') {
	const lang = String(language).toLowerCase();
	const t = (en, hi, hin) => lang === 'hi' ? hi : lang === 'hinglish' ? hin : en;
	
	const q = question.toLowerCase();
	
	// Investment basics
	if (q.includes('what is') && (q.includes('stock') || q.includes('share'))) {
		return t(
			'Stocks represent ownership in a company. When you buy stocks, you become a partial owner. Indian stocks are traded on NSE and BSE exchanges. Start with Nifty 50 companies for stability.',
			'शेयर किसी कंपनी में स्वामित्व का प्रतिनिधित्व करते हैं। जब आप शेयर खरीदते हैं, तो आप आंशिक मालिक बन जाते हैं। भारतीय शेयर NSE और BSE एक्सचेंज पर कारोबार होते हैं। स्थिरता के लिए निफ्टी 50 कंपनियों से शुरू करें।',
			'Stocks company me ownership represent karte hain. Jab aap stocks kharidte hain, to aap partial owner ban jaate hain. Indian stocks NSE aur BSE exchanges pe trade hote hain. Stability ke liye Nifty 50 companies se start karo.'
		);
	}
	
	if (q.includes('mutual fund') || q.includes('mf')) {
		return t(
			'Mutual funds pool money from multiple investors to invest in stocks, bonds, or other assets. In India, you can start SIP with just ₹500/month. ELSS funds offer tax benefits under Section 80C.',
			'म्यूचुअल फंड कई निवेशकों से पैसा जमा करके शेयर, बॉन्ड या अन्य संपत्तियों में निवेश करते हैं। भारत में, आप सिर्फ ₹500/माह से SIP शुरू कर सकते हैं। ELSS फंड सेक्शन 80C के तहत टैक्स लाभ प्रदान करते हैं।',
			'Mutual funds multiple investors se paisa pool karke stocks, bonds ya other assets me invest karte hain. India me, aap sirf ₹500/month se SIP start kar sakte hain. ELSS funds Section 80C ke tahat tax benefits dete hain.'
		);
	}
	
	if (q.includes('etf')) {
		return t(
			'ETFs (Exchange Traded Funds) track market indices like Nifty 50 or Sensex. They have lower fees than mutual funds and trade like stocks. Popular Indian ETFs include NIFTYBEES, SENSEXBEE.',
			'ETF (एक्सचेंज ट्रेडेड फंड) निफ्टी 50 या सेंसेक्स जैसे बाजार सूचकांकों को ट्रैक करते हैं। इनकी फीस म्यूचुअल फंड से कम होती है और ये शेयरों की तरह कारोबार होते हैं। लोकप्रिय भारतीय ETF में NIFTYBEES, SENSEXBEE शामिल हैं।',
			'ETFs (Exchange Traded Funds) market indices jaise Nifty 50 ya Sensex ko track karte hain. Inki fees mutual funds se kam hoti hai aur ye stocks ki tarah trade hote hain. Popular Indian ETFs me NIFTYBEES, SENSEXBEE include hain.'
		);
	}
	
	if (q.includes('sip')) {
		return t(
			'SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds. Benefits include rupee cost averaging, discipline, and compounding. Start with ₹500/month.',
			'SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) आपको म्यूचुअल फंड में नियमित रूप से एक निश्चित राशि निवेश करने की अनुमति देता है। लाभ में रुपये की लागत औसत, अनुशासन और चक्रवृद्धि शामिल हैं। ₹500/माह से शुरू करें।',
			'SIP (Systematic Investment Plan) aapko mutual funds me regularly fixed amount invest karne ki permission deta hai. Benefits me rupee cost averaging, discipline, aur compounding include hain. ₹500/month se start karo.'
		);
	}
	
	// Tax related
	if (q.includes('tax') || q.includes('ltcg') || q.includes('stcg')) {
		return t(
			'LTCG (Long Term Capital Gains): 10% tax on equity gains >₹1L after 1 year. STCG (Short Term): 15% on equity gains within 1 year. ELSS funds offer ₹1.5L deduction under Section 80C.',
			'LTCG (दीर्घकालिक पूंजीगत लाभ): 1 साल बाद ₹1L से अधिक इक्विटी लाभ पर 10% कर। STCG (अल्पकालिक): 1 साल के भीतर इक्विटी लाभ पर 15%। ELSS फंड सेक्शन 80C के तहत ₹1.5L कटौती प्रदान करते हैं।',
			'LTCG (Long Term Capital Gains): 1 saal baad ₹1L se zyada equity gains pe 10% tax. STCG (Short Term): 1 saal ke andar equity gains pe 15%. ELSS funds Section 80C ke tahat ₹1.5L deduction dete hain.'
		);
	}
	
	// Platform related
	if (q.includes('zerodha') || q.includes('groww') || q.includes('platform')) {
		return t(
			'Popular Indian investment platforms: Zerodha (₹20/order for stocks), Groww (free stock trading), Upstox (₹20/order). For mutual funds: Groww, Zerodha Coin, Paytm Money. For crypto: WazirX, CoinDCX.',
			'लोकप्रिय भारतीय निवेश प्लेटफॉर्म: Zerodha (शेयरों के लिए ₹20/ऑर्डर), Groww (मुफ्त शेयर ट्रेडिंग), Upstox (₹20/ऑर्डर)। म्यूचुअल फंड के लिए: Groww, Zerodha Coin, Paytm Money। क्रिप्टो के लिए: WazirX, CoinDCX।',
			'Popular Indian investment platforms: Zerodha (stocks ke liye ₹20/order), Groww (free stock trading), Upstox (₹20/order). Mutual funds ke liye: Groww, Zerodha Coin, Paytm Money. Crypto ke liye: WazirX, CoinDCX.'
		);
	}
	
	// Risk related
	if (q.includes('risk') || q.includes('safe')) {
		return t(
			'Investment risk levels: Low (FD, debt funds, 6-8% returns), Medium (balanced funds, large-cap stocks, 10-12% returns), High (mid-cap, small-cap, 12-15% returns). Diversify your portfolio across different asset classes.',
			'निवेश जोखिम स्तर: कम (FD, डेट फंड, 6-8% रिटर्न), मध्यम (बैलेंस्ड फंड, लार्ज-कैप शेयर, 10-12% रिटर्न), उच्च (मिड-कैप, स्मॉल-कैप, 12-15% रिटर्न)। अपने पोर्टफोलियो को विभिन्न परिसंपत्ति वर्गों में विविधता दें।',
			'Investment risk levels: Low (FD, debt funds, 6-8% returns), Medium (balanced funds, large-cap stocks, 10-12% returns), High (mid-cap, small-cap, 12-15% returns). Apne portfolio ko different asset classes me diversify karo.'
		);
	}
	
	// Emergency fund
	if (q.includes('emergency') || q.includes('fund')) {
		return t(
			'Emergency fund should be 6-12 months of your expenses. Keep it in FD or liquid funds for easy access. This should be your first priority before investing in stocks or mutual funds.',
			'आपातकालीन फंड आपके खर्चों का 6-12 महीना होना चाहिए। इसे FD या लिक्विड फंड में रखें ताकि आसानी से पहुंच सकें। यह शेयर या म्यूचुअल फंड में निवेश करने से पहले आपकी पहली प्राथमिकता होनी चाहिए।',
			'Emergency fund aapke expenses ka 6-12 months hona chahiye. Ise FD ya liquid funds me rakho taaki easily access kar sako. Ye stocks ya mutual funds me invest karne se pehle aapki pehli priority honi chahiye.'
		);
	}
	
	// Crypto related
	if (q.includes('crypto') || q.includes('bitcoin') || q.includes('btc')) {
		return t(
			'Cryptocurrency is highly volatile and risky. In India, use only registered exchanges like WazirX, CoinDCX. Keep allocation <5-10% of portfolio. TDS 1% applies on profits. Only invest what you can afford to lose.',
			'क्रिप्टोकरेंसी अत्यधिक अस्थिर और जोखिम भरी है। भारत में, केवल WazirX, CoinDCX जैसे पंजीकृत एक्सचेंज का उपयोग करें। पोर्टफोलियो का <5-10% आवंटन रखें। मुनाफे पर 1% TDS लागू होता है। केवल उतना निवेश करें जितना आप खो सकते हैं।',
			'Cryptocurrency bahut volatile aur risky hai. India me, sirf registered exchanges jaise WazirX, CoinDCX use karo. Portfolio ka <5-10% allocation rakho. Profits pe 1% TDS lagta hai. Sirf utna invest karo jitna aap lose kar sakte hain.'
		);
	}
	
	// Real estate
	if (q.includes('real estate') || q.includes('property') || q.includes('reit')) {
		return t(
			'Real estate investment requires large capital (₹10L+). Consider REITs for liquidity. Focus on metro cities like Mumbai, Delhi, Bangalore. Factor in stamp duty (5-7%), registration charges, and maintenance costs.',
			'रियल एस्टेट निवेश के लिए बड़ी पूंजी (₹10L+) की आवश्यकता होती है। तरलता के लिए REITs पर विचार करें। मुंबई, दिल्ली, बैंगलोर जैसे मेट्रो शहरों पर ध्यान दें। स्टाम्प ड्यूटी (5-7%), पंजीकरण शुल्क और रखरखाव लागत को ध्यान में रखें।',
			'Real estate investment ke liye badi capital (₹10L+) ki zarurat hoti hai. Liquidity ke liye REITs consider karo. Mumbai, Delhi, Bangalore jaise metro cities pe focus karo. Stamp duty (5-7%), registration charges, aur maintenance costs ko factor karo.'
		);
	}
	
	// General investment advice
	if (q.includes('how to start') || q.includes('beginner')) {
		return t(
			'Start with: 1) Build emergency fund (6-12 months expenses) 2) Complete KYC 3) Start SIP in large-cap mutual funds 4) Gradually add mid-cap and small-cap 5) Consider ELSS for tax benefits 6) Diversify across asset classes.',
			'शुरुआत करें: 1) आपातकालीन फंड बनाएं (6-12 महीने के खर्च) 2) KYC पूरा करें 3) लार्ज-कैप म्यूचुअल फंड में SIP शुरू करें 4) धीरे-धीरे मिड-कैप और स्मॉल-कैप जोड़ें 5) टैक्स लाभ के लिए ELSS पर विचार करें 6) परिसंपत्ति वर्गों में विविधता लाएं।',
			'Start karo: 1) Emergency fund banao (6-12 months expenses) 2) KYC complete karo 3) Large-cap mutual funds me SIP start karo 4) Dheere-dheere mid-cap aur small-cap add karo 5) Tax benefits ke liye ELSS consider karo 6) Asset classes me diversify karo.'
		);
	}
	
	// Nifty and Sensex related
	if (q.includes('nifty') || q.includes('sensex')) {
		return t(
			'Nifty 50 tracks top 50 companies on NSE, Sensex tracks top 30 on BSE. These are India\'s main market indices. You can invest in them via ETFs like NIFTYBEES or index funds. They provide broad market exposure with lower risk.',
			'निफ्टी 50 NSE पर शीर्ष 50 कंपनियों को ट्रैक करता है, सेंसेक्स BSE पर शीर्ष 30 को ट्रैक करता है। ये भारत के मुख्य बाजार सूचकांक हैं। आप NIFTYBEES जैसे ETF या इंडेक्स फंड के माध्यम से इनमें निवेश कर सकते हैं।',
			'Nifty 50 NSE pe top 50 companies ko track karta hai, Sensex BSE pe top 30 ko track karta hai. Ye India ke main market indices hain. Aap NIFTYBEES jaise ETF ya index funds ke through invest kar sakte hain.'
		);
	}
	
	// KYC related
	if (q.includes('kyc')) {
		return t(
			'KYC (Know Your Customer) is mandatory for all investments in India. You need PAN card, Aadhaar, bank details, and address proof. Complete KYC once and you can invest across all platforms. It\'s a one-time process.',
			'KYC (Know Your Customer) भारत में सभी निवेशों के लिए अनिवार्य है। आपको PAN कार्ड, आधार, बैंक विवरण और पता प्रमाण की आवश्यकता है। एक बार KYC पूरा करें और आप सभी प्लेटफॉर्म पर निवेश कर सकते हैं।',
			'KYC (Know Your Customer) India me sabhi investments ke liye mandatory hai. Aapko PAN card, Aadhaar, bank details, aur address proof ki zarurat hai. Ek baar KYC complete karo aur aap sabhi platforms pe invest kar sakte hain.'
		);
	}
	
	// Portfolio diversification
	if (q.includes('diversify') || q.includes('diversification')) {
		return t(
			'Diversification means spreading investments across different asset classes and sectors. In India: 40% large-cap stocks/MFs, 20% mid-cap, 10% small-cap, 20% debt funds/FD, 10% gold/REITs. This reduces risk and improves returns.',
			'विविधीकरण का अर्थ है विभिन्न परिसंपत्ति वर्गों और क्षेत्रों में निवेश फैलाना। भारत में: 40% लार्ज-कैप शेयर/एमएफ, 20% मिड-कैप, 10% स्मॉल-कैप, 20% डेट फंड/एफडी, 10% सोना/आरईआईटी।',
			'Diversification ka matlab hai different asset classes aur sectors me investment spread karna. India me: 40% large-cap stocks/MFs, 20% mid-cap, 10% small-cap, 20% debt funds/FD, 10% gold/REITs. Ye risk kam karta hai aur returns improve karta hai.'
		);
	}
	
	// Default response
	return t(
		'I\'m your SmartVestor AI assistant! I can help you with investment questions about stocks, mutual funds, ETFs, SIP, tax benefits, platforms like Zerodha/Groww, risk management, and more. What would you like to know?',
		'मैं आपका SmartVestor AI सहायक हूं! मैं शेयर, म्यूचुअल फंड, ETF, SIP, टैक्स लाभ, Zerodha/Groww जैसे प्लेटफॉर्म, जोखिम प्रबंधन और अधिक के बारे में निवेश प्रश्नों में आपकी मदद कर सकता हूं। आप क्या जानना चाहते हैं?',
		'Main aapka SmartVestor AI assistant hun! Main stocks, mutual funds, ETFs, SIP, tax benefits, platforms jaise Zerodha/Groww, risk management, aur more ke baare me investment questions me aapki help kar sakta hun. Aap kya janna chahte hain?'
	);
}

app.get('/api/health', (req, res) => {
	res.json({ ok: true, name: 'SmartVestor' });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
	const { name = '', email = '', password = '' } = req.body || {};
	if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
	const db = loadDb();
	const exists = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
	if (exists) return res.status(409).json({ error: 'User already exists' });
	const id = Date.now().toString();
	const hashed = bcrypt.hashSync(password, 10);
	const user = { id, name, email, password: hashed, createdAt: new Date().toISOString() };
	db.users.push(user);
	saveDb(db);
	const token = generateToken(user);
	res.json({ token, user: { id, name, email } });
});

app.post('/api/auth/login', (req, res) => {
	const { email = '', password = '' } = req.body || {};
	const db = loadDb();
	const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const ok = bcrypt.compareSync(password, user.password);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
	const token = generateToken(user);
	res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', auth, (req, res) => {
	res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// Demo Google sign-in (no OAuth; for quick start)
app.post('/api/auth/google-demo', (req, res) => {
	const db = loadDb();
	const email = 'demo.google.user@example.com';
	let user = db.users.find(u => u.email === email);
	if (!user) {
		user = { id: Date.now().toString(), name: 'Google Demo User', email, password: bcrypt.hashSync('google_demo', 10), createdAt: new Date().toISOString() };
		db.users.push(user);
		saveDb(db);
	}
	const token = generateToken(user);
	res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/recommend', (req, res) => {
	try {
		const input = req.body || {};
		const advice = generateAdvice(input);
		const db = loadDb();
		const record = { id: Date.now().toString(), input, advice, createdAt: new Date().toISOString() };
		db.sessions.push(record);
		saveDb(db);
		res.json(record);
	} catch (e) {
		res.status(500).json({ error: 'Failed to generate advice' });
	}
});

// Plans: save and list for authenticated user
app.post('/api/plans', auth, (req, res) => {
	try {
		const { title = 'My Plan', record } = req.body || {};
		if (!record || !record.advice) return res.status(400).json({ error: 'Invalid plan' });
		const db = loadDb();
		const plan = { id: Date.now().toString(), userId: req.user.id, title, record, createdAt: new Date().toISOString() };
		db.sessions.push(plan); // reuse sessions array for simplicity
		saveDb(db);
		res.json(plan);
	} catch (e) {
		res.status(500).json({ error: 'Failed to save plan' });
	}
});

app.get('/api/plans', auth, (req, res) => {
	try {
		const db = loadDb();
		const plans = db.sessions.filter(s => s.userId === req.user.id && s.record && s.record.advice);
		res.json({ plans });
	} catch (e) {
		res.status(500).json({ error: 'Failed to load plans' });
	}
});

// AI Assistant endpoint
app.post('/api/ai-assistant', (req, res) => {
	try {
		const { question, language = 'hinglish' } = req.body || {};
		if (!question) return res.status(400).json({ error: 'Question is required' });
		
		const answer = generateAIResponse(question, language);
		res.json({ 
			question, 
			answer,
			timestamp: new Date().toISOString(),
			language 
		});
	} catch (e) {
		res.status(500).json({ error: 'Failed to generate AI response' });
	}
});

// Serve React build if present
const clientBuild = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuild)) {
	app.use(express.static(clientBuild));
	app.get('*', (req, res) => {
		res.sendFile(path.join(clientBuild, 'index.html'));
	});
}

app.listen(PORT, () => {
	console.log(`SmartVestor server running on http://localhost:${PORT}`);
});

