# BKeep Accounting Frontend

Modern accounting software built with React 19, TypeScript, and Vite.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Access the app at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker

### Run with Docker (Recommended)

```bash
# Build and run
docker-compose up -d --build

# Access at http://localhost
```

### Pull from Docker Hub

```bash
# Pull the image
docker pull YOUR_USERNAME/bkeep-frontend:latest

# Run the container
docker run -d -p 80:80 --name bkeep-frontend YOUR_USERNAME/bkeep-frontend:latest
```

### Docker Documentation

- **Quick Start**: [DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md)
- **Complete Guide**: [DOCKER.md](./DOCKER.md)
- **Push to Docker Hub**: [DOCKER-PUSH-QUICKSTART.md](./DOCKER-PUSH-QUICKSTART.md)
- **Setup Summary**: [DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)

## 📦 Tech Stack

- **Framework**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Radix UI primitives
- **State Management**: Zustand 5.0.8
- **Data Fetching**: TanStack React Query 5.90.7
- **Routing**: React Router 7.8.2
- **Forms**: React Hook Form 7.69.0 + Zod 4.3.4
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React
- **Charts**: Recharts 3.3.0
- **Theming**: next-themes

## 🛠️ Available Scripts

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
```

### Docker
```bash
npm run docker:build           # Build Docker image
npm run docker:build:clean     # Build without cache
npm run docker:up              # Start container
npm run docker:down            # Stop container
npm run docker:logs            # View logs
npm run docker:restart         # Restart container
npm run docker:deploy          # Clean build + deploy
npm run docker:push            # Push to Docker Hub
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI primitives (Radix)
│   ├── shared/         # Shared components
│   ├── auth/           # Authentication components
│   ├── transactions/   # Transaction components
│   └── [feature]/      # Feature-specific components
├── pages/              # Page components
│   ├── protected/      # Authenticated pages
│   └── public/         # Public pages
├── services/apis/      # API service functions
├── stores/             # Zustand state stores
├── types/              # TypeScript types
├── hooks/              # Custom React hooks
├── routes/             # Route definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

## 🔧 Configuration

### Environment Variables

Create a `.env.development` file:

```env
VITE_API_ENDPOINT=http://localhost:4000/api/v1
VITE_ENVIRONMENT=development
```

For production (Docker builds):
```env
VITE_API_ENDPOINT=https://api.example.com/v1
VITE_ENVIRONMENT=production
```

### API Configuration

The API endpoint is configured in `src/config/env.ts` and can be overridden via environment variables.

## 🐳 Docker Hub

### Push to Docker Hub

```bash
# Build the image
docker-compose build

# Push to Docker Hub
./docker-push.sh YOUR_DOCKERHUB_USERNAME
```

See [DOCKER-PUSH-QUICKSTART.md](./DOCKER-PUSH-QUICKSTART.md) for details.

### Pull from Docker Hub

Once pushed, anyone can pull and run:

```bash
docker pull YOUR_USERNAME/bkeep-frontend:latest
docker run -d -p 80:80 YOUR_USERNAME/bkeep-frontend:latest
```

## 🚢 Deployment

### Using Docker (Recommended)

```bash
# Build production image with custom API endpoint
VITE_API_ENDPOINT=https://api.example.com docker-compose build

# Deploy
docker-compose up -d

# Or use the deploy script
npm run docker:deploy
```

### Manual Deployment

```bash
# Build
npm run build

# Serve the dist/ directory with any static file server
# Example with serve:
npx serve -s dist -l 80
```

## 📝 Code Style

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **Line Length**: 80 characters
- **Trailing Commas**: ES5 style

Format code with:
```bash
npm run format
```

## 🧪 Development Guidelines

- Follow the coding patterns in `.cursorrules`
- Use TypeScript for all components
- Keep components focused and single-purpose
- Use React Query for data fetching
- Use Zustand for global state
- Follow the existing naming conventions

## 🔒 Security

- Never commit sensitive data (.env files are gitignored)
- Use environment variables for configuration
- API keys should be server-side only
- Docker images don't include sensitive data

## 📊 Performance

- Multi-stage Docker build (~60MB final image)
- Code splitting configured in vite.config.ts
- Lazy loading for heavy components
- Optimized asset caching in nginx

## 🐛 Troubleshooting

### Development Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Docker Issues

```bash
# Clean build
docker-compose build --no-cache

# View logs
docker-compose logs -f

# Check container status
docker ps

# Access container shell
docker exec -it bkeep-frontend sh
```

See [DOCKER.md](./DOCKER.md) for complete troubleshooting guide.

## 📚 Documentation

- **Docker Setup**: [DOCKER.md](./DOCKER.md)
- **Docker Quick Start**: [DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md)
- **Docker Hub Push**: [DOCKER-HUB-PUSH.md](./DOCKER-HUB-PUSH.md)
- **Setup Summary**: [DOCKER-SETUP-SUMMARY.md](./DOCKER-SETUP-SUMMARY.md)
- **Build Checklist**: [DOCKER-CHECKLIST.md](./DOCKER-CHECKLIST.md)
- **Coding Rules**: [.cursorrules](./.cursorrules)

## 🤝 Contributing

1. Follow the code style guidelines
2. Write meaningful commit messages
3. Test changes locally before committing
4. Update documentation when needed

## 📄 License

Proprietary - BKeep Team

## 🆘 Support

For issues or questions:
- Check the documentation in the repo
- Review Docker logs: `docker-compose logs -f`
- Verify configuration: Check environment variables

---

Built with ❤️ by BKeep Team
