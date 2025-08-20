import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  category?: string;
}

interface KeyboardShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardKey: React.FC<{ keyName: string; modifier?: boolean }> = ({ 
  keyName, 
  modifier = false 
}) => (
  <Badge 
    variant={modifier ? "default" : "secondary"} 
    className={`px-2 py-1 text-xs font-mono ${
      modifier ? 'bg-primary text-primary-foreground' : ''
    }`}
  >
    {keyName}
  </Badge>
);

const ShortcutRow: React.FC<{ shortcut: KeyboardShortcut }> = ({ shortcut }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground flex-1">
      {shortcut.description}
    </span>
    <div className="flex items-center gap-1">
      {shortcut.ctrlKey && (
        <>
          <KeyboardKey keyName="Ctrl" modifier />
          <span className="text-muted-foreground">+</span>
        </>
      )}
      {shortcut.shiftKey && (
        <>
          <KeyboardKey keyName="Shift" modifier />
          <span className="text-muted-foreground">+</span>
        </>
      )}
      {shortcut.altKey && (
        <>
          <KeyboardKey keyName="Alt" modifier />
          <span className="text-muted-foreground">+</span>
        </>
      )}
      <KeyboardKey keyName={shortcut.key.toUpperCase()} />
    </div>
  </div>
);

export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  isOpen,
  onClose,
  shortcuts
}) => {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {categoryShortcuts.map((shortcut, index) => (
                    <ShortcutRow key={index} shortcut={shortcut} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Keyboard shortcuts work when not typing in input fields</p>
            <p className="mt-1">Press <KeyboardKey keyName="ESC" /> to close dialogs</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};