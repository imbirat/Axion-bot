'use client';

interface EmbedPreviewProps {
  normalText?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: string;
  color?: string;
}

export default function EmbedPreview({ normalText, title, description, imageUrl, thumbnailUrl, footer, color = '#3B82F6' }: EmbedPreviewProps) {
  const hasContent = normalText || title || description || imageUrl || thumbnailUrl || footer;

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        <p>No preview yet</p>
        <p className="text-xs mt-1">Fill in fields above to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {normalText && <p className="text-sm text-[var(--text)]">{normalText}</p>}
      <div
        className="rounded-md bg-[var(--card)] p-4"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            {title && <h4 className="font-semibold text-[var(--text)]">{title}</h4>}
            {description && <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{description}</p>}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Embed image"
                className="rounded-md max-w-full max-h-64 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {footer && <p className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">{footer}</p>}
          </div>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-20 h-20 rounded-md object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
