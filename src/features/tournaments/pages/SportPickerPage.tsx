import { Link } from 'react-router-dom';
import { Card, CardTitle } from '@/shared/ui/Card';
import { ErrorState, LoadingState } from '@/shared/ui/StateView';
import { useSports } from '@/features/catalog/api';

export function SportPickerPage() {
  const { data: sports, isPending, isError, error, refetch } = useSports();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Card>
      <CardTitle>Выберите вид спорта</CardTitle>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {sports.map((sport) => (
          <Link
            key={sport.code}
            to={`/create/${sport.code}`}
            className="border-line bg-surface hover:border-brand-dim flex flex-col items-center gap-2.5 rounded-xl border px-3 py-6 text-center transition-colors"
          >
            <span className="text-3xl">{sport.icon}</span>
            <span className="text-ink text-sm font-semibold">{sport.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
