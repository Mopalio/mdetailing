# Next.js 15 + Tailwind CSS 4 Project

A modern, scalable Next.js project with Tailwind CSS 4, featuring a well-organized folder structure and best practices for production applications.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### First Time Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd mdetails
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind CSS 4
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage component
│   ├── loading.tsx        # Global loading component
│   ├── not-found.tsx      # 404 page
│   ├── robots.txt         # SEO robots file
│   ├── sitemap.ts         # Dynamic sitemap generator
│   └── sitemap.xml/       # Sitemap route handler
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── sections/             # Page sections
│   ├── Hero/            # Hero section
│   └── Features/        # Features section
├── services/            # API and business logic
│   └── api.ts          # API service
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── translations/       # Internationalization files
```

## ⚙️ Configuration Steps

### 1. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Base URL for SEO
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 2. Tailwind CSS 4 Configuration

The project uses Tailwind CSS 4 with the new `@import "tailwindcss"` syntax. The configuration is in `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### 3. SEO Configuration

#### Meta Tags
Update the metadata in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Site Name',
  description: 'Your site description',
  keywords: ['keyword1', 'keyword2'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Your Site Name',
    description: 'Your site description',
    url: 'https://yourdomain.com',
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Site Name',
    description: 'Your site description',
    images: ['https://yourdomain.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

#### Sitemap Configuration
The sitemap is automatically generated at `/sitemap.xml`. Update `src/app/sitemap.ts` to include your actual URLs.

#### Robots.txt
The robots.txt file is located at `src/app/robots.txt`. Update the sitemap URL to match your domain.

### 4. Custom Tailwind Variables

Add custom CSS variables in `src/app/globals.css`:

```css
@theme inline {
  /* Custom colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #6b7280;
  
  /* Custom spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Custom fonts */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 5. Component Development

#### Creating New UI Components
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Use TypeScript interfaces for props
4. Include proper accessibility attributes

Example:
```typescript
// src/components/ui/NewComponent.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface NewComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function NewComponent({ className, children }: NewComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

#### Creating New Sections
1. Create folder in `src/sections/`
2. Include `index.ts`, component file, and `mapper.ts`
3. Export from `src/sections/index.ts`

### 6. API Integration

The project includes a service layer in `src/services/api.ts`. Use it for API calls:

```typescript
import { ApiService } from '@/services/api';

// GET request
const data = await ApiService.get('/endpoint');

// POST request
const result = await ApiService.post('/endpoint', { data });
```

### 7. TypeScript Configuration

The project uses strict TypeScript configuration. Add new types in `src/types/`:

```typescript
// src/types/new-feature.ts
export interface NewFeature {
  id: string;
  name: string;
  description: string;
}
```

### 8. Internationalization

Translation files are in `src/translations/`. Add new languages by creating new JSON files and updating the translation system.

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

## 📦 Dependencies

### Core Dependencies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React version
- **Tailwind CSS 4**: Latest Tailwind with new syntax
- **TypeScript**: Type safety

### Development Dependencies
- **ESLint**: Code linting
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the project: `npm run build`
2. Start the production server: `npm run start`
3. Set environment variables for your platform

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BASE_URL` | Your domain for SEO | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL | No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

## 🔧 Customization

### Adding New Pages
Since this is a single-page application, all content should be added as sections to the homepage. If you need multiple pages later, you can add them to the `src/app/` directory.

### Styling
- Use Tailwind CSS classes for styling
- Create custom components in `src/components/ui/`
- Add custom CSS variables in `src/app/globals.css`

### State Management
For simple state, use React hooks. For complex state, consider adding Zustand or Redux Toolkit.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
