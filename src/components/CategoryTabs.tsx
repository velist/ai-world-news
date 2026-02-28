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
      switch (category) {
        case '全部': return 'All';
        case 'AI': return 'AI';
        case '科技': return 'Tech';
        case '经济': return 'Economy';
        case '深度分析': return 'Analysis';
        default: return category;
      }
    }
    return category;
  };

  return (
    <div className="w-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex gap-1.5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap transition-all duration-250 ease-in-out"
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FDFBF9' : 'hsl(var(--muted-foreground))',
                background: isActive ? 'hsl(var(--foreground))' : 'transparent',
                border: isActive ? '1px solid hsl(var(--foreground))' : '1px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'hsl(var(--card))';
                  e.currentTarget.style.borderColor = 'hsl(var(--border))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
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
