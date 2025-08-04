import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const { isZh } = useLanguage();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case '全部':
        return '📰';
      case 'ai':
        return '🤖';
      case 'ai模型':
      case 'ai 模型':
        return '🤖';
      case '科技':
        return '💻';
      case '经济':
        return '📈';
      case '深度分析':
        return '🔍';
      default:
        return '📰';
    }
  };

  const getCategoryName = (category: string) => {
    if (!isZh) {
      switch (category) {
        case '全部':
          return 'All';
        case 'AI':
          return 'AI';
        case '科技':
          return 'Tech';
        case '经济':
          return 'Economy';
        case '深度分析':
          return 'Analysis';
        default:
          return category;
      }
    }
    return category;
  };

  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="inline-flex h-auto bg-muted/50 p-1 rounded-xl backdrop-blur-sm border border-border/50">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-medium whitespace-nowrap"
            >
              <span className="text-base">{getCategoryIcon(category)}</span>
              <span>{getCategoryName(category)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};