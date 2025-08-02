# SlideLink Backend

Backend API for SlideLink - A presentation slide sharing platform for universities.

## Features

- Collection management (create, join, delete)
- Slide submission system
- QR code generation
- Admin dashboard API
- Contact form handling
- Auto-cleanup of expired collections

## Setup Instructions

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file with your configuration

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

4. For production:
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Collections
- `POST /api/collections` - Create new collection
- `POST /api/collections/join` - Join collection with password
- `GET /api/collections/:username` - Get collection details
- `GET /api/collections/:username/submissions` - Get submissions
- `POST /api/collections/:username/submissions` - Submit slides
- `GET /api/collections/search` - Search collections

### Admin
- `GET /api/admin/collections` - Get all collections (admin only)
- `DELETE /api/admin/collections/:id` - Delete collection (admin only)

### Other
- `POST /api/contact` - Contact form
- `GET /api/health` - Health check
# samin
