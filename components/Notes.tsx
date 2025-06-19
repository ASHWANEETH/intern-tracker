"use client";

interface NotesProps {
  requirements: string;
}

const color = {
  bg: "bg-yellow-50",
  border: "border-yellow-200",
  text: "text-yellow-900",
  corner: "bg-yellow-100 border-yellow-200",
};

export default function Notes({ requirements }: NotesProps) {
  return (
    <div className="space-y-4">
      {requirements
        .replace(/^#+/, "")
        .split("#")
        .map((noteBlock, blockIndex) => (
          <div
            key={blockIndex}
            className={`relative mt-3 p-3 rounded-xl shadow-md border-l-4 ${color.bg} ${color.border}`}
          >
            <h4 className={`font-bold mb-2 ${color.text}`}>Notes</h4>
            <ul
              className={`text-sm list-disc list-inside space-y-1 ${color.text}`}
            >
              {noteBlock.split(",").map((item, index) => (
                <li key={index}>{item.trim()}</li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
