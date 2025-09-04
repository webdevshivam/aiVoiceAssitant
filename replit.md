# Overview

This is a modern full-stack web application built as an AI sales assistant platform. The application enables users to create and manage AI-powered sales conversations using Google's Gemini AI. Users can configure custom sales prompts, engage in voice-enabled conversations, and manage conversation history through an intuitive interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built using React 18 with TypeScript, utilizing a modern component-based architecture:

- **UI Framework**: React with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement and development optimizations

The frontend follows a modular structure with reusable UI components, custom hooks, and page-based routing. The application supports both text and voice interactions through the Web Speech API.

## Backend Architecture

The server is built using Express.js with TypeScript in an ESM module system:

- **Framework**: Express.js with middleware for JSON parsing and request logging
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Validation**: Zod for runtime type checking and API validation
- **AI Integration**: Google Generative AI (@google/genai) for conversation processing
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

The API follows RESTful conventions with dedicated routes for conversations, settings, and AI chat functionality. Error handling is centralized through Express middleware.

## Data Storage Solutions

The application uses PostgreSQL as the primary database with the following schema design:

- **Conversations Table**: Stores conversation metadata including title, sales prompt, message history (JSONB), and status
- **Settings Table**: Manages user preferences for AI behavior, voice settings, and application configuration
- **Database Migrations**: Handled through Drizzle Kit with version-controlled schema changes

All database interactions are type-safe through Drizzle ORM's TypeScript integration, with shared schema definitions between client and server.

## Authentication and Authorization

Currently implements a basic session-based approach:

- **Storage Interface**: Abstract storage layer with in-memory implementation for development
- **Session Management**: Express sessions with PostgreSQL backing store
- **Future Extensibility**: Architecture supports adding authentication providers

## External Dependencies

### AI Services
- **Google Generative AI**: Gemini Pro model for generating sales responses and conversation processing
- **Configuration**: API key management through environment variables or user settings

### Database Services  
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Connection**: Configured through DATABASE_URL environment variable

### Development Tools
- **Replit Integration**: Custom Vite plugins for development environment and error overlay
- **Build Pipeline**: ESBuild for server bundling and Vite for client assets

### Voice and Audio
- **Web Speech API**: Native browser APIs for speech recognition and synthesis
- **Voice Configuration**: Customizable voice types, speeds, and audio quality settings

The application is designed to be deployment-ready with environment-based configuration and supports both development and production modes through conditional middleware loading.