# Next.js/Electron Form Application

A desktop application built with Next.js, Electron, Redux, and Material-UI that allows users to input and view form data.

## Features

- Form input with validation using React Hook Form
- State management with Redux
- Modern UI components with Material-UI
- Desktop application packaging with Electron

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Run in development mode (Next.js + Electron)
npm run electron-dev
```

## Building

```bash
# Build the application
npm run electron-build
```

The built application will be available in the `dist` directory.

## Project Structure

```
├── src/
│   ├── app/              # Next.js pages
│   ├── store/            # Redux store configuration
│   └── types/            # TypeScript type definitions
├── electron/             # Electron main process
└── package.json          # Project configuration
```

## Technologies Used

- Next.js
- Electron
- Redux Toolkit
- Material-UI
- React Hook Form
- TypeScript
