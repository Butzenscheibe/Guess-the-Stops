# Analytics, IP Logging, and SEO Setup Guide

This document describes the analytics, IP logging, and SEO features that have been added to the Guess the Stations application.

## Google Analytics Setup

### Getting Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Create a new GA4 property for your website
4. Navigate to Admin > Data Streams
5. Click on your web stream
6. Copy the "Measurement ID" (format: G-XXXXXXXXXX)

### Configuring Analytics in Your Application

Replace `GA_MEASUREMENT_ID` in the following files with your actual Measurement ID:
- `js/Backend/public/index.html`
- `js/Backend/public/sort-the-stations.html`
- `js/Backend/public/shared-result.html`

Find and replace:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace both instances of `GA_MEASUREMENT_ID` with your actual ID (e.g., `G-ABC123XYZ`).

### Alternative: Using Environment Variables (Recommended for Production)

For better security and deployment flexibility, you can use environment variables:

1. Create a `.env` file in `js/Backend/`:
```
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

2. Install dotenv: `npm install dotenv`

3. Modify `index.js` to inject the GA ID into HTML templates dynamically (requires additional template engine setup).

## IP Logging

### How It Works

The application now logs all incoming requests with the following information:
- Timestamp
- Client IP address (handles proxies via X-Forwarded-For header)
- HTTP method and URL
- User-Agent string

### Log File Location

Logs are stored in: `js/Backend/logs/ip-access.log`

This directory is automatically created and excluded from git via `.gitignore`.

### Log Format

```
2025-11-13T10:42:00.000Z | IP: 192.168.1.1 | GET /index.html | User-Agent: Mozilla/5.0...
```

### Privacy Considerations

⚠️ **Important**: Logging IP addresses may be subject to privacy regulations (GDPR, CCPA, etc.):
- Consider adding a privacy policy to your website
- Inform users about data collection in your terms of service
- Implement log rotation and retention policies
- Consider anonymizing IP addresses after a certain period

### Managing Logs

You can implement log rotation to prevent files from growing too large. Consider using tools like:
- `logrotate` on Linux
- Custom Node.js log rotation libraries
- Cloud-based log management services

## SEO Optimization

### Features Implemented

1. **Enhanced Meta Tags**
   - Improved descriptions and keywords
   - Open Graph tags for social media sharing
   - Twitter Card tags
   - Canonical URLs

2. **Structured Data (JSON-LD)**
   - Schema.org markup for better search engine understanding
   - WebApplication schema with author information

3. **robots.txt**
   - Located at `/robots.txt`
   - Allows all search engines
   - References sitemap

4. **sitemap.xml**
   - Located at `/sitemap.xml`
   - Lists all main pages with priority and update frequency

### Customization Required

Update the following placeholder URLs in all HTML files and SEO files:
- Replace `https://yourdomain.com/` with your actual domain
- Replace `https://yourdomain.com/og-image.png` with your actual Open Graph image URL

### Open Graph Image

Create a 1200x630px image for social media previews and save it as `public/og-image.png`.

### Submitting to Search Engines

1. **Google Search Console**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your property
   - Submit your sitemap: `https://yourdomain.com/sitemap.xml`

2. **Bing Webmaster Tools**
   - Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
   - Add your site
   - Submit your sitemap

## Testing

### Test Analytics
1. Replace GA_MEASUREMENT_ID with your actual ID
2. Visit your website
3. Check Google Analytics Real-Time reports to see active users

### Test IP Logging
1. Start the server: `node index.js`
2. Visit the website
3. Check `logs/ip-access.log` for entries

### Test SEO
- Use [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Use [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Security Notes

- The IP logger middleware is placed early in the middleware chain to capture all requests
- Logs are excluded from version control via `.gitignore`
- Consider implementing rate limiting to prevent abuse
- Regularly review and clean up old logs
