import { findNode, getPrimarySelection } from '@viewfoundry/core';
import { useEditorState, useEditorStore } from './EditorContext.js';

export function SelectedNodeActions() {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const selection = useEditorState((s) => s.selection);
  const registry = useEditorState((s) => s.registry);
  const nodeId = getPrimarySelection(selection);

  if (!nodeId || nodeId === 'root') return null;

  const node = findNode(document.root, nodeId);
  if (!node) return null;

  const label = registry.get(node.type)?.label ?? node.type;

  return (
    <div className="vf-node-actions">
      <button
        type="button"
        className="vf-node-action vf-node-action-danger"
        aria-label={`Remove ${label} from canvas`}
        onClick={() => store.getState().deleteSelected()}
      >
        Remove {label}
      </button>
      <p className="vf-node-actions-hint">
        Tip: Delete or Backspace removes the selected component
      </p>
    </div>
  );
}
