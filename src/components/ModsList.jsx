import { useState } from 'react';
import ModPreview from "./ModPreview.jsx";

function sortMods(mods, filterMode) {
  if (filterMode == "mostDownloaded") {
    return mods.sort((a, b) => b.downloads - a.downloads)
  }
  else if (filterMode == "leastDownloaded") {
    return mods.sort((a, b) => a.downloads - b.downloads)
  }
  else if (filterMode == "new") {
    return mods.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
  }
  else if (filterMode == "old") {
    return mods.sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
  }
  return mods;
}

export default function ModList({ mods }) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('mostDownloaded');

  const filteredMods = sortMods(mods, filterMode)
    .filter((mod) => search == "" || mod.name.toLowerCase().includes(search.toLowerCase()) || mod.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="d-flex mw-100 ms-2 flex-wrap align-content-around">
        <select label="Sort by" class="input me-2 bg-dark text-light rounded pe-2" onChange={(e) => setFilterMode(e.target.value)}>
          <option value="mostDownloaded">Sort by: Most downloaded</option>
          <option value="leastDownloaded">Sort by: Least downloaded</option>
          <option value="new">Sort by: Newest</option>
          <option value="old">Sort by: Oldest</option>
        </select>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded me-2 bg-dark text-light"/>
      </div>
      <div className="d-flex justify-content-center mw-100 flex-wrap align-content-around">
        {filteredMods.map((mod) => (
          <ModPreview mod={mod}/>
        ))}
      </div>
    </div>
  );
}
