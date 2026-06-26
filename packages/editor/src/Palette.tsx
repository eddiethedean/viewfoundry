import { useEditorState, useEditorStore } from './EditorContext.js';

export type PaletteProps = Record<string, never>;

export function Palette(_props: PaletteProps) {
  const store = useEditorStore();
  const registry = useEditorState((s) => s.registry);
  const filter = useEditorState((s) => s.paletteFilter);
  const grouped = registry.byCategory();

  const filtered = Object.entries(grouped).reduce(
    (acc, [category, defs]) => {
      const items = defs.filter((def) => {
        const q = filter.toLowerCase();
        if (!q) return true;
        return (
          def.type.toLowerCase().includes(q) ||
          (def.label ?? '').toLowerCase().includes(q) ||
          category.toLowerCase().includes(q)
        );
      });
      if (items.length > 0) acc[category] = items;
      return acc;
    },
    {} as Record<string, typeof grouped[string]>,
  );

  return (
    <div className="vf-palette">
      <div className="vf-panel-header">Components</div>
      <input
        className="vf-palette-search"
        type="search"
        placeholder="Search components..."
        value={filter}
        onChange={(e) => store.getState().setPaletteFilter(e.target.value)}
      />
      <div className="vf-palette-list">
        {Object.entries(filtered).map(([category, defs]) => (
          <div key={category} className="vf-palette-category">
            <div className="vf-palette-category-label">{category}</div>
            {defs.map((def) => (
              <button
                key={def.type}
                type="button"
                className="vf-palette-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/viewfoundry-component', def.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => store.getState().insertComponent(def.type)}
              >
                <span className="vf-palette-item-label">{def.label ?? def.type}</span>
                {def.description && (
                  <span className="vf-palette-item-desc">{def.description}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
