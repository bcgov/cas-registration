"use client";

interface NoteProps {
  children: React.ReactNode;
  variant?: "info" | "important";
}

const Note = ({ children, variant = "info" }: NoteProps) => {
  const bgColour = variant === "info" ? "bc-bg-grey" : "bc-yellow";

  return (
    <div className="relative w-full" data-testid="note">
      <div
        // relative positioning combined with left: 50% and transform: translateX(-50%)
        // to extend background colour to full width of the screen
        // -translate-y-4 to move the note up past the inner padding in Main.tsx 'padding-page' class
        className={`bg-${bgColour} relative left-1/2 transform -translate-x-1/2 -translate-y-4 w-screen max-w-none`}
      >
        <div
          data-testid="note"
          className={`max-w-page mx-auto padding-page bg-${bgColour} h-fit text-lg`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Note;
