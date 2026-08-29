"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          className={cn(
            "fixed right-5 bottom-22 z-50 size-12 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-95 sm:right-8 sm:bottom-8",
            visible
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-75 opacity-0"
          )}
        >
          <ArrowUp className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Go to top</TooltipContent>
    </Tooltip>
  );
};

export default ScrollToTopButton;
