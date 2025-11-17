# 🌾 Isolated News Scraping System

## Overview
This is a **completely isolated** news scraping system that runs independently from all other features in your MERN application.

## ✅ What's Included

### Backend Files
```
agri_backend/
├── scraper/
│   ├── newsScraper.js      # Main scraping logic
│   ├── newsCronJob.js      # Cron job (every 30 minutes)
│   └── README.md           # This file
├── models/
│   └── newsModel.js        # Isolated News model
└── routes/
    └── newsRoute.js        # Isolated News routes
```

### Frontend Files
```
Farming/src/Component/HomePage/
└── LatestNewsBox.jsx       # News display component
```

## 🚀 Features

✅ **Automatic Scraping**: Runs every 30 minutes
✅ **Multiple Sources**: Scrapes 4+ agriculture websites
✅ **Duplicate Prevention**: Avoids saving duplicate news
✅ **Latest First**: Always sorted by date (descending)
✅ **Fail-Safe**: Won't break your app if scraping fails
✅ **Isolated**: No interference with existing features

## 📡 API Endpoints

### 1. Get All News
```http
GET /api/news
```

**Query Parameters:**
- `limit` (optional): Number of items (default: 50)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "news": [
    {
      "_id": "...",
      "title": "New Agriculture Scheme Launched",
      "description": "Details about the scheme...",
      "link": "https://...",
      "date": "2024-01-15T10:30:00.000Z",
      "source": "Mizoram Agriculture Department"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### 2. Manually Trigger Scraping
```http
POST /api/news/run
```

**Response:**
```json
{
  "success": true,
  "message": "News scraping completed",
  "total": 25,
  "savedCount": 15,
  "skippedCount": 10
}
```

## 🕐 Automatic Scraping

The system automatically scrapes news **every 30 minutes** using a cron job.

**Schedule**: `*/30 * * * *` (Every 30 minutes)

**What it does:**
1. Scrapes all configured websites
2. Filters news from last 60 days
3. Saves new items to database
4. Skips duplicates
5. Logs results

## 🌐 Scraped Sources

1. **Mizoram Agriculture Department**
   - URL: http://agriculturemizoram.nic.in
   - Type: News, Updates, Announcements

2. **Serchhip District**
   - URL: https://serchhip.nic.in/schemes/
   - Type: Schemes, Updates

3. **IMD Aizawl Weather**
   - URL: https://mausam.imd.gov.in/aizawl/
   - Type: Weather Updates, Advisories

4. **Lawngtlai Agriculture**
   - URL: https://lawngtlai.nic.in/agriculture/
   - Type: Agriculture Updates

## 🎨 Frontend Component

### LatestNewsBox

**Location**: `Farming/src/Component/HomePage/LatestNewsBox.jsx`

**Features:**
- ✅ Skeleton loading animation
- ✅ Error handling with retry
- ✅ Clickable cards linking to original source
- ✅ Refresh button
- ✅ Responsive design
- ✅ TailwindCSS styling

**Usage:**
```jsx
import LatestNewsBox from './LatestNewsBox';

function MyPage() {
  return (
    <div>
      <LatestNewsBox />
    </div>
  );
}
```

## 🔧 Adding New Websites

To add a new website to scrape:

1. Open `agri_backend/scraper/newsScraper.js`

2. Create a new scraper function:

```javascript
const scrapeNewWebsite = async () => {
  try {
    const url = 'https://your-website.com';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const news = [];

    $('.your-selector').each((_, element) => {
      const title = $(element).find('.title').text().trim();
      const link = $(element).find('a').attr('href');
      const description = $(element).find('.description').text().trim();

      if (title && link) {
        news.push({
          title,
          link: link.startsWith('http') ? link : `${url}${link}`,
          description: description.substring(0, 500),
          date: new Date(),
          source: 'Your Website Name'
        });
      }
    });

    return news;
  } catch (error) {
    console.error('Error scraping:', error.message);
    return [];
  }
};
```

3. Add it to the `scrapeAllNews` function:

```javascript
const scrapers = [
  // ... existing scrapers
  { fn: scrapeNewWebsite, name: 'Your Website' }
];
```

## 📊 Database Schema

```javascript
{
  title: String,        // News title (required)
  description: String,  // Brief description
  link: String,        // URL to original source (unique)
  date: Date,          // Publication date
  source: String,      // Source name (required)
  createdAt: Date,     // When scraped
  updatedAt: Date      // Last updated
}
```

## 🛠️ Manual Testing

### 1. Test Scraping
```bash
# Using curl
curl -X POST http://localhost:5000/api/news/run

# Using Postman/Thunder Client
POST http://localhost:5000/api/news/run
```

### 2. Get News
```bash
curl http://localhost:5000/api/news?limit=10
```

## 🔍 Troubleshooting

### No news appearing?
1. Check if backend server is running
2. Manually trigger scraping: `POST /api/news/run`
3. Check server logs for errors
4. Verify websites are accessible

### Scraping fails?
- Some websites may block automated requests
- Check if website structure has changed
- Verify selectors in scraper functions
- Check timeout settings (default: 10 seconds)

### Duplicates appearing?
- System prevents duplicates based on link URL
- If duplicates appear, check link normalization
- Verify unique index on `link` field

## 📝 Important Notes

- ✅ **Isolated**: This system is completely separate from existing features
- ✅ **No Breaking Changes**: Won't affect your e-commerce, orders, or other APIs
- ✅ **Fail-Safe**: If scraping fails, your app continues normally
- ✅ **Performance**: Scraping runs in background, doesn't block requests
- ✅ **Scalable**: Easy to add more websites

## 🎯 Integration Points

This system integrates with your app at only 2 points:

1. **Backend**: `agri_backend/index.js`
   - Adds route: `app.use("/api/news", newsRoute)`
   - Initializes cron: `initializeNewsCron()`

2. **Frontend**: `Farming/src/Component/HomePage/SchemesList.jsx`
   - Imports: `<LatestNewsBox />`
   - Displays above existing schemes list

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend server starts without errors
- [ ] Cron job initializes (check console logs)
- [ ] Can access: `GET /api/news`
- [ ] Can trigger: `POST /api/news/run`
- [ ] Frontend component displays
- [ ] News cards are clickable
- [ ] Refresh button works
- [ ] No interference with existing features

## 🎉 You're All Set!

The isolated news scraping system is now running!

- **Automatic scraping**: Every 30 minutes
- **API endpoint**: `http://localhost:5000/api/news`
- **Frontend**: Visible on Mizoram Agriculture Resources page

Enjoy your automated agriculture news updates! 🌾
