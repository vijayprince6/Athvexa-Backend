# Athvexa Sports Portal

A comprehensive sports social media platform for athletes, coaches, and sports enthusiasts to share achievements, connect with others, and track their progress.

## Features

- **User Profiles**: Athlete and Coach profiles with detailed information
- **Achievement Posts**: Share sports achievements with the community
- **Points System**: 13-category achievement levels (from Training to Olympic Gold)
- **Rankings**: Leaderboard system across 28 supported sports
- **AI-Powered Insights**: Ask AI for profile summaries and athlete information using Gemini AI
- **Real-time Chat**: Connect with other athletes and coaches
- **Coaches Directory**: Find and connect with sports coaches
- **Community Feed**: View and interact with achievements from the community
- **Image Uploads**: Powered by Cloudinary for efficient media management

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.1.5
- **Language**: Java 17
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT with Spring Security
- **AI Integration**: Google Gemini API (gemini-3.6-flash)
- **Image Storage**: Cloudinary
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Deployment**: Firebase Hosting

## Project Structure

```
Athvexa/
├── Backend/
│   ├── src/main/java/com/athvexa/
│   │   ├── config/          # Security, Cloudinary, App configuration
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Database repositories
│   │   ├── service/         # Business logic
│   │   └── AthvexaApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   ├── .env.development
│   ├── .env.production
│   └── package.json
└── README.md
```

## Environment Variables

### Backend (Required)

Create these environment variables for your deployment platform (Render, Railway, etc.):

```properties
# Database (Supabase PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://your-supabase-host:6543/postgres?prepareThreshold=0
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password

# Security
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters

# Cloudinary (Image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server Port (automatically set by deployment platform)
PORT=10000
```

### Frontend

#### `.env.development` (Local development)
```
REACT_APP_API_URL=http://localhost:10000
```

#### `.env.production` (Production deployment)
```
REACT_APP_API_URL=https://your-backend-domain.com
```

## Local Development

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- PostgreSQL database (or Supabase account)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd Backend
   ```

2. **Set environment variables** (Windows PowerShell):
   ```powershell
   $env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/athvexa"
   $env:SPRING_DATASOURCE_USERNAME="postgres"
   $env:SPRING_DATASOURCE_PASSWORD="your-password"
   $env:JWT_SECRET="your-jwt-secret-minimum-32-characters"
   $env:CLOUDINARY_CLOUD_NAME="your-cloud-name"
   $env:CLOUDINARY_API_KEY="your-api-key"
   $env:CLOUDINARY_API_SECRET="your-api-secret"
   $env:GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Build and run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Backend will start on `http://localhost:10000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env.development`** (if not exists):
   ```
   REACT_APP_API_URL=http://localhost:10000
   ```

4. **Start development server**:
   ```bash
   npm start
   ```

   Frontend will start on `http://localhost:3000`

## Deployment

### Backend Deployment (Render/Railway)

1. **Connect your GitHub repository** to Render/Railway

2. **Configure build settings**:
   - **Build Command**: `mvn clean install`
   - **Start Command**: `java -jar target/athvexa-backend-1.0.0.jar`
   - **Root Directory**: `Backend`

3. **Set environment variables** (in Render/Railway dashboard):
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`

4. **Deploy**: Platform will automatically build and deploy

### Frontend Deployment (Firebase Hosting)

1. **Update `.env.production`** with your backend URL:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

2. **Build production bundle**:
   ```bash
   cd Frontend
   npm run build
   ```

3. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

   Or use Firebase console to upload the `build` folder.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile/{userId}` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search?query={username}` - Search users
- `GET /api/users/coaches?sport={sport}` - Get coaches by sport

### Posts
- `POST /api/posts/create` - Create achievement post
- `GET /api/posts/all` - Get all posts
- `GET /api/posts/user/{userId}` - Get user's posts
- `DELETE /api/posts/{postId}` - Delete post

### Likes
- `POST /api/likes/like?userId={id}&postId={id}` - Toggle like

### Rankings
- `GET /api/rankings/top?sport={sport}&limit={n}` - Get top athletes

### AI Profile Summary
- `POST /api/ai/profile-summary` - Get AI-powered profile summary
  ```json
  {
    "username": "vijul_vijul",
    "question": "what sport does he play?" // optional
  }
  ```

### Chat
- `GET /api/chat/users` - Get chat users
- `GET /api/chat/messages?user1={id}&user2={id}` - Get messages
- `POST /api/chat/send` - Send message

## Supported Sports (28 Total)

Archery, Athletics, Badminton, Baseball, Basketball, Boxing, Carrom, Chess, Cricket, Cycling, Fencing, Football, Golf, Gymnastics, Handball, Hockey, Ice Hockey, Judo, Kabaddi, Karate, Rugby, Skating, Snooker, Surfing, Swimming, Table Tennis, Tennis, Volleyball, Weightlifting, Wrestling, Horse Riding

## Points System

| Level | Points | Description |
|-------|--------|-------------|
| Training | 1 | Training/Practice |
| School | 5 | School competition |
| College | 10 | College competition |
| District | 50 | District level |
| State | 100 | State level |
| National | 500 | National level |
| International | 1000 | International level |
| World Championship Bronze | 2000 | World Championship 3rd |
| World Championship Silver | 3000 | World Championship 2nd |
| World Championship Gold | 4000 | World Championship 1st |
| Olympic Bronze | 3000 | Olympic 3rd place |
| Olympic Silver | 4000 | Olympic 2nd place |
| Olympic Gold | 5000 | Olympic 1st place |

## Security

- JWT-based authentication
- BCrypt password hashing (strength 8 for performance)
- CORS configuration for cross-origin requests
- Environment variable-based secrets management
- No hardcoded credentials in source code

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or feature requests, please create an issue in the GitHub repository.

---

**Built with ❤️ for the sports community**
