import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import type { FeatureCatalogItem } from '../lib/types';
import { FeatureCard } from './FeatureCard';
import { FeatureOptionsDrawer } from './FeatureOptionsDrawer';

interface FeatureCatalogProps {
  catalog: FeatureCatalogItem[];
  selectedIds: string[];
  onToggle: (featureId: string, enabled: boolean) => void;
  onUpdateOptions: (featureId: string, options: Record<string, unknown>) => void;
  billingVisible: boolean;
  formatCurrency: (value: number) => string;
  dependencyMap: Record<string, string[]>;
  conflictMap: Record<string, string[]>;
  selectionOptions: Record<string, Record<string, unknown> | undefined>;
  onRegisterSearchFocus?: (fn: () => void) => void;
  isAdmin?: boolean;
  adminMode?: boolean;
  pinnedFeatureIds?: string[];
  onOpenCatalogEditor?: (featureId?: string) => void;
}

const allCategory = 'ALL';

export const FeatureCatalog = ({
  catalog,
  selectedIds,
  onToggle,
  onUpdateOptions,
  billingVisible,
  formatCurrency,
  dependencyMap,
  conflictMap,
  selectionOptions,
  onRegisterSearchFocus,
  isAdmin,
  adminMode,
  pinnedFeatureIds,
  onOpenCatalogEditor,
}: FeatureCatalogProps) => {
  const categories = useMemo(() => {
    const unique = new Set([allCategory]);
    catalog.forEach((item) => unique.add(item.category));
    return Array.from(unique);
  }, [catalog]);

  const [activeCategory, setActiveCategory] = useState(allCategory);
  const [search, setSearch] = useState('');
  const [drawerFeature, setDrawerFeature] = useState<FeatureCatalogItem | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const pinnedSet = useMemo(() => new Set(pinnedFeatureIds), [pinnedFeatureIds]);

  const filteredCatalog = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (activeCategory !== allCategory && item.category !== activeCategory) {
        return false;
      }
      if (!trimmed) return true;
      return (
        item.name.toLowerCase().includes(trimmed) ||
        item.description.toLowerCase().includes(trimmed) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(trimmed))
      );
    });
  }, [catalog, activeCategory, search]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    onRegisterSearchFocus?.(focusSearch);
    return () => onRegisterSearchFocus?.(null);
  }, [focusSearch, onRegisterSearchFocus]);

  const selectedCount = selectedIds.length;

  const handleOpenOptions = (feature: FeatureCatalogItem) => {
    setDrawerFeature(feature);
  };

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Select features</h2>
          <p className="text-sm text-muted-foreground">
            Toggle the modules you need. Dependencies are handled automatically. Use “/” to jump to search.
          </p>
        </div>
        <div className="rounded-full border border-border/50 bg-surface/70 px-4 py-2 text-sm text-muted-foreground">
          {selectedCount} selected
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search catalog"
            className="pl-11"
            aria-label="Search features"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category === allCategory ? 'All' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {isAdmin && adminMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenCatalogEditor?.()}
            className="whitespace-nowrap"
          >
            Edit catalog
          </Button>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {filteredCatalog.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl border border-border/60 bg-surface/60 p-8 text-center text-sm text-muted-foreground"
          >
            No features match your filters.
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            layout
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredCatalog.map((feature) => (
              <motion.div key={feature.id} layout>
                <FeatureCard
                  feature={feature}
                  selected={selectedIds.includes(feature.id)}
                  onToggle={onToggle}
                  onConfigure={() => handleOpenOptions(feature)}
                  billingVisible={billingVisible}
                  formatCurrency={formatCurrency}
                  dependencies={dependencyMap[feature.id] ?? []}
                  conflicts={conflictMap[feature.id] ?? []}
                  disabled={!adminMode && pinnedSet.has(feature.id)}
                  disabledReason={!adminMode && pinnedSet.has(feature.id) ? 'Pinned by ConfigPro admin' : undefined}
                  pinned={pinnedSet.has(feature.id)}
                  hidden={feature.adminMeta?.hidden}
                  onEditCatalog={isAdmin ? () => onOpenCatalogEditor?.(feature.id) : undefined}
                  showAdminControls={Boolean(isAdmin && adminMode)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <FeatureOptionsDrawer
        feature={drawerFeature}
        isOpen={Boolean(drawerFeature)}
        onClose={() => setDrawerFeature(null)}
        value={drawerFeature ? selectionOptions[drawerFeature.id] : undefined}
        onSave={(options) => {
          if (drawerFeature) {
            onUpdateOptions(drawerFeature.id, options);
          }
        }}
      />
    </div>
  );
};
