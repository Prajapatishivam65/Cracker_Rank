"use client";

import { useState, useEffect } from "react";

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the screen width is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Consider screens smaller than 1024px as mobile
    };

    // Set initial value
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
