import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const { isZh } = useLanguage();

  const getCategoryName = (category: string) => {
    if (!isZh) {
      const map: Record<string, string> = {
        '全部': 'ALL', '中国AI': 'CN', '国际AI': 'INTL', '科技新闻': 'TECH', 'AI趣味新闻': 'FUN',
      };
      return map[category] || category;
    }
    return category;
  };

  return (
    <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex gap-0 border-b border-border" style={{ WebkitOverflowScrolling: 'touch' }}>
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap transition-colors duration-150 relative"
              style={{
                padding: '10px 16px',
                fontSize: '11px',
                fontFamily: "'DM Mono', monospace",
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {getCategoryName(category)}
            </button>
          );
        })}
      </div>
    </div>
  );
};