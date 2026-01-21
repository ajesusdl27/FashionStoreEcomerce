import { useState, createContext, useContext, type ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ defaultValue, children, className = '', onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsList({ children, className = '', variant = 'default' }: TabsListProps) {
  const variantClasses = {
    default: 'flex gap-1 p-1 bg-muted rounded-lg',
    pills: 'flex gap-2 flex-wrap',
    underline: 'flex gap-6 border-b border-border',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`} role="tablist">
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export function Tab({ value, children, className = '', disabled = false, icon }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${isActive 
          ? 'bg-card text-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ value, children, className = '' }: TabContentProps) {
  const { activeTab } = useTabsContext();
  
  if (activeTab !== value) return null;

  return (
    <div 
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

// Add animation keyframes to global.css if not present
// For now, inline style fallback:
const style = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
`;

// Compound exports
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Content = TabContent;

export default Tabs;
