# Cookie Consent & Privacy Implementation - Switzerland

## Overview

This implementation provides GDPR/Swiss DSG compliant cookie consent management with German language support for a Switzerland-based website.

## Features Implemented

### 1. Cookie Consent Banner
- **Automatic display** on first visit
- **Dual language support** (German for Swiss users)
- **Two-choice consent**: "Nur notwendige" (Essential only) or "Alle akzeptieren" (Accept all)
- **Persistent storage**: Consent stored for 365 days
- **Visual design**: Modern, non-intrusive banner at bottom of screen
- **Mobile responsive**: Adapts to all screen sizes

### 2. Privacy Documents

#### Datenschutzerklärung (Privacy Policy) - `/privacy-policy.html`
Comprehensive German-language privacy policy covering:
- Data collection and processing (IP logging, server logs)
- Cookie usage (necessary and analytical)
- Google Analytics with consent mode
- User rights under GDPR (access, deletion, portability, etc.)
- Swiss data protection authority contact
- EDÖB (Swiss Federal Data Protection Commissioner) information

#### Impressum (Legal Notice) - `/legal-notice.html`
German-language legal notice including:
- Website operator information
- Content liability disclaimers
- External links disclaimer
- Copyright information
- Swiss law compliance

### 3. Consent Management System

The JavaScript-based consent manager (`cookie-consent.js`) provides:

**Consent Modes:**
- `necessary: true` - Always enabled (essential cookies)
- `analytics: false/true` - Based on user choice

**Features:**
- Automatic Google Analytics consent mode integration
- Cookie-based consent storage (365-day expiry)
- Before-consent analytics blocking
- Consent update capability
- Proxy-safe IP handling

**Cookie Details:**
- Name: `gts_cookie_consent`
- Storage: JSON format with timestamp
- Path: `/` (site-wide)
- SameSite: `Lax` (CSRF protection)

### 4. Google Analytics Consent Mode

Updated GA4 implementation to respect user consent:

```javascript
// Default: Analytics denied until consent
gtag('consent', 'default', {
    'analytics_storage': 'denied'
});

// After user accepts: Analytics enabled
gtag('consent', 'update', {
    'analytics_storage': 'granted'
});

// IP anonymization enabled
gtag('config', 'GA_MEASUREMENT_ID', {
    'anonymize_ip': true
});
```

## Files Added/Modified

### New Files:
1. `js/Backend/public/cookie-consent.js` - Consent management logic
2. `js/Backend/public/cookie-consent.css` - Banner and privacy page styling
3. `js/Backend/public/privacy-policy.html` - Privacy policy (German)
4. `js/Backend/public/legal-notice.html` - Legal notice/Impressum (German)

### Modified Files:
1. `js/Backend/public/index.html` - Added consent banner and updated GA4
2. `js/Backend/public/sort-the-stations.html` - Added consent banner and updated GA4
3. `js/Backend/public/shared-result.html` - Added consent banner and updated GA4

## Legal Compliance

### Swiss Data Protection (DSG)
✅ Explicit consent for analytics cookies
✅ Information about data processing
✅ User rights clearly stated
✅ EDÖB contact information provided
✅ Data retention periods specified

### GDPR Compliance
✅ Consent before non-essential cookies (Art. 6 DSGVO)
✅ Right to access, deletion, portability (Art. 15-20 DSGVO)
✅ Privacy policy with all required information (Art. 13 DSGVO)
✅ IP anonymization for analytics
✅ Complaint mechanism (supervisory authority)

## User Flow

1. **First Visit:**
   - Cookie banner appears at bottom
   - Analytics blocked by default
   - User chooses "Nur notwendige" or "Alle akzeptieren"

2. **Choice: "Nur notwendige" (Essential only):**
   - Consent saved as `{necessary: true, analytics: false}`
   - Google Analytics remains disabled
   - Banner hides and doesn't reappear for 365 days

3. **Choice: "Alle akzeptieren" (Accept all):**
   - Consent saved as `{necessary: true, analytics: true}`
   - Google Analytics enabled with IP anonymization
   - Banner hides and doesn't reappear for 365 days

4. **Return Visits:**
   - Consent cookie checked
   - Banner not shown if consent exists
   - Analytics automatically enabled/disabled based on previous choice

## Testing Checklist

- [x] Cookie banner appears on first visit
- [x] "Nur notwendige" button saves correct consent
- [x] "Alle akzeptieren" button saves correct consent
- [x] Banner hides after selection
- [x] Consent persists across page reloads
- [x] Privacy policy page accessible
- [x] Legal notice page accessible
- [x] Links in banner work correctly
- [x] Mobile responsive design
- [x] Dark mode support
- [x] GA4 consent mode integration
- [x] IP anonymization enabled

## Customization

### Language
To change from German to another language, edit:
- `cookie-consent.js` - Banner text strings
- `privacy-policy.html` - Full privacy policy
- `legal-notice.html` - Full legal notice

### Styling
Customize colors and appearance in `cookie-consent.css`:
- Banner colors: `.cookie-banner` section
- Button styles: `.cookie-btn-primary`, `.cookie-btn-secondary`
- Dark mode: `.dark-mode` selectors

### Consent Duration
Change cookie expiry in `cookie-consent.js`:
```javascript
this.consentExpiry = 365; // Change to desired days
```

## Privacy Best Practices

1. **IP Logging**: The existing IP logging should be mentioned in privacy policy ✅
2. **Data Retention**: Specify retention periods in privacy policy ✅
3. **User Rights**: Provide mechanism for users to exercise rights ✅
4. **Transparency**: Clear information about all data processing ✅
5. **Consent Recording**: Timestamp stored with consent ✅

## Notes for Production

1. **Update Contact Information**: Replace placeholder contact details in privacy policy and legal notice
2. **Verify GA4 ID**: Ensure `GA_MEASUREMENT_ID` is replaced with actual tracking ID
3. **Test Analytics**: Verify Google Analytics receives events only after consent
4. **Monitor Compliance**: Regularly review and update privacy policy as needed
5. **Cookie Audit**: Periodically audit all cookies to ensure privacy policy is accurate

## Support

For questions about this implementation:
- Review the code comments in `cookie-consent.js`
- Check browser console for any errors
- Verify cookies in browser DevTools
- Test consent flow in incognito mode

## Resources

- **Swiss EDÖB**: https://www.edoeb.admin.ch
- **GDPR Info**: https://gdpr-info.eu
- **Google Consent Mode**: https://support.google.com/analytics/answer/9976101
- **Cookie Law (ePrivacy)**: EU Directive 2002/58/EC
