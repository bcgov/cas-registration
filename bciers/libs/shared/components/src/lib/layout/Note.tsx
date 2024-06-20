"use client";

interface NoteProps {
  children: React.ReactNode;
  variant?: "info" | "important";
}

const Note = ({ children, variant = "info" }: NoteProps) => {
  const bgColour = variant === "info" ? "bc-bg-grey" : "bc-yellow";

  return (
    <div className="relative w-full">
      <div
        // relative positioning combined with left: 50% and transform: translateX(-50%)
        // to extend background colour to full width of the screen
        className={`bg-${bgColour} relative left-1/2 transform -translate-x-1/2 w-screen max-w-none`}
      >
        <div
          className={`max-w-[1536px] mx-auto px-6 bg-${bgColour} py-5 h-fit text-lg`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Note;
