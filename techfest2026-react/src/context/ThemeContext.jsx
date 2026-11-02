import { createContext, useState, useContext } from "react";

// Step 1: Create a context
const ThemeContext = createContext();

// Step 2: Create a provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Step 3: Custom hook to access the context
export function useTheme() {
  return useContext(ThemeContext);
}