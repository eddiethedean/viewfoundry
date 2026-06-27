import { renderBoardElement } from '@viewfoundry/board';
import { useCodeFirstContext } from './code-first-context.js';

export type BoardStageProps = {
  className?: string;
};

export function BoardStage({ className }: BoardStageProps) {
  const { board, viewport, mode } = useCodeFirstContext();
  const content = renderBoardElement(board);

  return (
    <div
      className={`vf-board-stage${className ? ` ${className}` : ''}`}
      data-vf-stage
      data-vf-mode={mode}
      style={{
        width: viewport.width,
        minHeight: viewport.height,
        maxWidth: '100%',
        margin: '0 auto',
        background: board.background ?? 'transparent',
      }}
    >
      <div className="vf-board-stage-inner">{content}</div>
    </div>
  );
}
