"use client";

interface NoteProps {
  children: React.ReactNode;
  variant?: "info" | "important";
}

const Note = ({ children, variant = "info" }: NoteProps) => {
  // Full class names so Tailwind can detect them
  const bgColour = variant === "info" ? "bg-bc-bg-grey" : "bg-bc-yellow";

  return (
    <div className="relative w-full">
      <div
        // relative positioning combined with left: 50% and transform: translateX(-50%)
        // to extend background colour to full width of the screen
        // -translate-y-4 to move the note up past the inner padding in Main.tsx 'padding-page' class
        className={`${bgColour} relative left-1/2 transform -translate-x-1/2 -translate-y-4 w-screen max-w-none`}
      >
        <div
          data-testid="note"
          className={`max-w-page mx-auto padding-page ${bgColour} h-fit text-lg`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Note;
