"use client";

import { useEffect, useRef, useState } from "react";

interface NoteProps {
  children: React.ReactNode;
  variant?: "info" | "important";
}

const Note = ({ children, variant = "info" }: NoteProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const bgColour = variant === "info" ? "bc-bg-grey" : "bc-yellow";

  useEffect(() => {
    // When the component gets mounted, get the height of the children div
    // This is so we can add padding to the bottom of the parent div to prevent content from being hidden
    // due to the absolute positioning of the children which is necessary for the extended background colour to work

    if (ref?.current) setHeight(ref.current.offsetHeight);

    // to handle page resize
    const getHeight = () => {
      if (ref?.current) setHeight(ref.current.offsetHeight);
    };
    window.addEventListener("resize", getHeight);

    // remove the event listener before the component gets unmounted
    return () => window.removeEventListener("resize", getHeight);
  }, []);

  return (
    <div
      className="relative w-full"
      style={{
        paddingBottom: `${height}px`,
      }}
    >
      <div
        // absolute positioning combined with left: 50% and transform: translateX(-50%)
        // to extend background colour to full width of the screen
        className={`bg-${bgColour} absolute left-1/2 transform -translate-x-1/2 w-screen max-w-none`}
      >
        <div
          className={`max-w-[1536px] mx-auto px-7 bg-${bgColour} py-5 h-[${height}px] text-lg`}
          ref={ref}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Note;
