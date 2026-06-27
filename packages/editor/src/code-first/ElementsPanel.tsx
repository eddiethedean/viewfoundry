import type { ParsedJsxElement } from '@viewfoundry/sync';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

function ElementTreeNode({ element }: { element: ParsedJsxElement }) {
  const store = useCodeFirstStore();
  const parsed = useCodeFirstState((s) => s.parsed);
  const selectedElementId = useCodeFirstState((s) => s.selectedElementId);
  const isSelected = selectedElementId === element.id;

  if (!parsed) return null;

  return (
    <li className="vf-elements-node">
      <button
        type="button"
        className={isSelected ? 'vf-elements-item vf-elements-item--selected' : 'vf-elements-item'}
        aria-pressed={isSelected}
        onClick={() => store.getState().selectElement(element.id)}
        title={`Jump to ${element.tagName} (line ${element.location.line})`}
      >
        {element.tagName}
      </button>
      {element.childIds.length > 0 && (
        <ul className="vf-elements-children">
          {element.childIds.map((childId) => {
            const child = parsed.elements.get(childId);
            return child ? <ElementTreeNode key={child.id} element={child} /> : null;
          })}
        </ul>
      )}
    </li>
  );
}

export function ElementsPanel() {
  const parsed = useCodeFirstState((s) => s.parsed);
  const activeSourceFile = useCodeFirstState((s) => s.activeSourceFile);

  if (!parsed) {
    return (
      <section className="vf-elements" aria-label="Elements">
        <p className="vf-elements-empty">No source loaded</p>
      </section>
    );
  }

  return (
    <section className="vf-elements vf-layers" aria-label="Elements">
      <header className="vf-panel-header">
        <h2>Elements</h2>
        <span className="vf-elements-source">{activeSourceFile}</span>
      </header>
      <ul className="vf-elements-tree">
        {parsed.rootIds.map((id) => {
          const el = parsed.elements.get(id);
          return el ? <ElementTreeNode key={el.id} element={el} /> : null;
        })}
      </ul>
    </section>
  );
}
