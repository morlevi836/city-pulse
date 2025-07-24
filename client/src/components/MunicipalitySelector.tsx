import React from "react";
import { useFilteredOptions } from "../hooks/useFilteredOptions";

type Props = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
};

function MunicipalitySelector({ options, selected, onChange }: Props) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);

  const { filteredOptions } = useFilteredOptions(options, searchTerm);

  const handleOptionSelect = React.useCallback(
    (option: string) => {
      onChange(option === "הצג את כל הערים" ? "" : option);
      setSearchTerm(option);
    },
    [onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev + 1 < filteredOptions.length ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedOption = filteredOptions[highlightedIndex];
        handleOptionSelect(selectedOption);
      }
    },
    [filteredOptions, handleOptionSelect, highlightedIndex]
  );

  React.useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll("li");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div
      className="absolute top-4 right-4 z-[1000] bg-white rounded shadow p-3 w-64 font-medium"
      style={{ direction: "rtl" }}
    >
      <div
        className={`flex justify-between items-center cursor-pointer ${
          collapsed ? "mb-0" : "mb-2"
        }`}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <label
          htmlFor="municipality-search"
          className="text-gray-700 font-semibold select-none"
        >
          בחר עיר להצגה
        </label>
        <span className="select-none text-gray-600">
          {collapsed ? "🔽" : "🔼"}
        </span>
      </div>

      {!collapsed && (
        <>
          <input
            id="municipality-search"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="התחל להקליד שם עיר..."
            className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
          />

          <ul
            ref={listRef}
            className="max-h-40 overflow-y-auto border border-gray-200 rounded bg-white"
          >
            {filteredOptions.map((name, index) => (
              <li
                key={name}
                onClick={() => handleOptionSelect(name)}
                className={`px-2 py-1 cursor-pointer 
                  ${name === selected ? "bg-blue-200 font-bold" : ""} 
                  ${index === highlightedIndex ? "bg-blue-100" : ""}`}
              >
                {name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default React.memo(MunicipalitySelector);
