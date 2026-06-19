'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveBarProps {
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  isSaving: boolean;
}

export default function SaveBar({ isDirty, onSave, onDiscard, isSaving }: SaveBarProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: isDirty ? 0 : 100 }}
      className="fixed bottom-0 left-[260px] right-0 z-40 border-t border-[var(--border)] bg-[var(--card)] px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <AlertCircle className="h-4 w-4 text-[var(--warning)]" />
        You have unsaved changes
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
          Discard
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
