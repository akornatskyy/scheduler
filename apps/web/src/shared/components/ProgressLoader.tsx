import {useSignal} from '$shared/hooks';
import {$showProgress} from '$shared/signals';

export function ProgressLoader() {
  const visible = useSignal($showProgress);

  if (!visible) return null;

  return (
    <div role="progressbar" aria-busy="true" className="progress">
      <div className="bar" />
    </div>
  );
}
