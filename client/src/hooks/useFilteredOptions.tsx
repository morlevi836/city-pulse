import { useMemo } from "react";

export function useFilteredOptions(options: string[], searchTerm: string) {
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.localeCompare(b, "he"));
  }, [options]);

  const filteredOptions = useMemo(() => {
    const allOptions = ["הצג את כל הערים", ...sortedOptions];
    return allOptions.filter((name) => name.includes(searchTerm));
  }, [sortedOptions, searchTerm]);

  return { sortedOptions, filteredOptions };
}
