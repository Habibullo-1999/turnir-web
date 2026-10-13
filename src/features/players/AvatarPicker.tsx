import { Button } from '@/shared/ui/Button';
import { buttonClass } from '@/shared/ui/buttonStyles';
import { errorMessage } from '@/shared/api/http';
import { resizeToAvatar } from '@/shared/lib/image';
import { Avatar } from './Avatar';
import { useRemoveAvatar, useUploadAvatar } from './api';

/**
 * Выбор аватарки. Картинка уменьшается в браузере до 256px — сервер ресайзить
 * не умеет, а снимок с телефона весит мегабайты.
 */
export function AvatarPicker({
  playerId,
  name,
  avatarUrl,
}: {
  playerId: string;
  name: string;
  avatarUrl?: string;
}) {
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();

  async function pick(file: File | undefined) {
    if (!file) return;
    upload.mutate({ id: playerId, file: await resizeToAvatar(file) });
  }

  const busy = upload.isPending || remove.isPending;

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} url={avatarUrl} size="lg" />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {/* Поле внутри label, а не спрятано за кнопкой: так оно остаётся
              доступным с клавиатуры и для скринридера. */}
          <label className={buttonClass('secondary', 'sm', busy ? 'opacity-60' : 'cursor-pointer')}>
            {upload.isPending ? 'Загружаем…' : '📷 Выбрать картинку'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                void pick(event.target.files?.[0]);
                // Сброс, иначе тот же файл второй раз не выберется.
                event.target.value = '';
              }}
            />
          </label>

          {avatarUrl && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => remove.mutate(playerId)}
            >
              Убрать
            </Button>
          )}
        </div>

        <p className="text-ink-dim text-xs">PNG, JPEG или GIF. Уменьшим сами.</p>

        {(upload.isError || remove.isError) && (
          <p className="text-danger text-xs">⚠️ {errorMessage(upload.error ?? remove.error)}</p>
        )}
      </div>
    </div>
  );
}
