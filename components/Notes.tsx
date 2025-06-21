"use client";

interface NotesProps {
  requirements: string;
}

const color = {
  bg: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-800",
  corner: "bg-gray-100 border-gray-200",
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
            className={`relative mb-2 p-3 rounded-xl shadow-md border-l-4 ${color.bg} ${color.border}`}
          >
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
