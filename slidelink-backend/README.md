# SlideLink Backend

Backend API for SlideLink - A presentation slide sharing platform for universities.

## Features

- Collection management (create, join, delete)
- Slide submission system
- QR code generation
- Admin dashboard API
- Contact form handling
- Auto-cleanup of expired collections
- MongoDB integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file with your configuration:
\`\`\`env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/slidelink
\`\`\`

3. Start MongoDB service (if using local MongoDB)

4. Start development server:
\`\`\`bash
npm run dev
\`\`\`

5. For production:
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

## Database Schema

### Collections
\`\`\`javascript
{
  _id: ObjectId,
  username: String,
  section: String,
  courseCode: String,
  semester: String,
  faculty: String,
  department: String,
  teamCount: Number,
  password: String (hashed),
  creatorEmail: String,
  createdAt: Date
}
\`\`\`

### Submissions
\`\`\`javascript
{
  _id: ObjectId,
  collectionId: ObjectId,
  teamName: String,
  slideLink: String,
  leaderEmail: String,
  submittedAt: Date
}
\`\`\`

### Contacts
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  subject: String,
  message: String,
  createdAt: Date
}
\`\`\`
