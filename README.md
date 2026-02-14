
# Samsung One UI Calculator Clone

A high-fidelity clone of the Samsung One UI Calculator, built with React and Tailwind CSS. This application mimics the native experience with smooth animations, dark/light mode support, and a responsive scientific layout.

## Features

*   **Standard Layout**: Basic arithmetic operations for portrait mode.
*   **Scientific Layout**: Advanced mathematical functions (Trigonometry, Logarithms, Roots, etc.) appear automatically in landscape mode.
*   **History**: Save and recall previous calculations.
*   **Theming**: Automatic system theme detection (Dark/Light) with a manual toggle.
*   **Responsive**: Fluid adaptation to screen resizing and orientation changes.

## Getting your-username

### Prerequisites

*   Node.js (v14 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/HasibVau42/samsung-calculator-clone.git
    cd samsung-calculator-clone
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## App Build & Interaction

### Running Locally (Development)

To start the application in development mode with hot-reloading:

```bash
npm start
# or if using Vite
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view it in the browser.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles the React application into static files in the `build/` (or `dist/`) directory, ready for deployment.

### Testing

If test suites are configured (e.g., using Jest or Vitest), run the following command to execute them:

```bash
npm test
```

## User Interaction Guide

1.  **Basic Math**: Use the portrait view for standard addition, subtraction, multiplication, and division.
2.  **Scientific Mode**:
    *   **Mobile**: Rotate your phone to landscape mode.
    *   **Desktop**: Resize the browser window width to be larger than the height to trigger landscape mode.
    *   *Access functions like `sin`, `cos`, `tan`, `log`, `ln`, `root`, etc.*
3.  **History**:
    *   Click the **Clock Icon** to open the history panel.
    *   Tap any history item to load that expression back into the main display.
    *   Use "Clear History" to wipe local session data.
4.  **Themes**:
    *   Click the **Sun/Moon Icon** to toggle between Light and Dark themes.
    *   The app defaults to your device's system preference on load.
