/**
 * Cookie Consent Manager for Swiss GDPR Compliance
 * Manages user consent for cookies and analytics tracking
 */

class CookieConsent {
    constructor() {
        this.cookieName = 'gts_cookie_consent';
        this.consentExpiry = 365; // days
        this.init();
    }

    init() {
        // Check if user has already given consent
        const consent = this.getConsent();
        
        if (consent === null) {
            // Show banner if no consent recorded
            this.showBanner();
        } else if (consent.analytics) {
            // Load analytics if previously consented
            this.loadAnalytics();
        }
    }

    getConsent() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(this.cookieName + '='));
        
        if (!cookie) return null;
        
        try {
            return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        } catch (e) {
            return null;
        }
    }

    setConsent(consent) {
        const expires = new Date();
        expires.setDate(expires.getDate() + this.consentExpiry);
        
        const value = encodeURIComponent(JSON.stringify(consent));
        document.cookie = `${this.cookieName}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }

    showBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Datenschutz & Cookies</h3>
                    <p>
                        Wir verwenden Cookies und ähnliche Technologien, um die Nutzung unserer Website zu analysieren 
                        und Ihre Erfahrung zu verbessern. Durch die Nutzung dieser Website stimmen Sie der Verwendung 
                        von technisch notwendigen Cookies zu.
                    </p>
                    <p class="cookie-banner-text-small">
                        <strong>Analytische Cookies (optional):</strong> Helfen uns zu verstehen, wie Besucher mit unserer 
                        Website interagieren (Google Analytics). Diese Daten werden anonymisiert und zur Verbesserung 
                        unserer Dienste verwendet.
                    </p>
                    <p class="cookie-banner-links">
                        <a href="/privacy-policy.html" target="_blank">Datenschutzerklärung</a> | 
                        <a href="/legal-notice.html" target="_blank">Impressum</a>
                    </p>
                </div>
                <div class="cookie-banner-buttons">
                    <button id="cookie-reject" class="cookie-btn cookie-btn-secondary">
                        Nur notwendige
                    </button>
                    <button id="cookie-accept" class="cookie-btn cookie-btn-primary">
                        Alle akzeptieren
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', () => {
            this.acceptConsent();
        });
        
        document.getElementById('cookie-reject').addEventListener('click', () => {
            this.rejectConsent();
        });
        
        // Animate in
        setTimeout(() => banner.classList.add('show'), 100);
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    acceptConsent() {
        this.setConsent({
            necessary: true,
            analytics: true,
            timestamp: new Date().toISOString()
        });
        this.hideBanner();
        this.loadAnalytics();
    }

    rejectConsent() {
        this.setConsent({
            necessary: true,
            analytics: false,
            timestamp: new Date().toISOString()
        });
        this.hideBanner();
    }

    loadAnalytics() {
        // Only load analytics if GA_MEASUREMENT_ID is configured
        const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
        
        // Check if GA script exists and has real ID (not placeholder)
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.includes('GA_MEASUREMENT_ID')) {
                // Analytics already loaded or ID is configured
                // Enable analytics tracking
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    });
                }
            }
        });
    }

    // Public method to show settings
    showSettings() {
        this.showBanner();
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cookieConsent = new CookieConsent();
    });
} else {
    window.cookieConsent = new CookieConsent();
}
