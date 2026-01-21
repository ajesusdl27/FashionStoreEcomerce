import { useState, useCallback } from 'react';
import { ShoppingCart, Calendar, UserPlus, User, RefreshCw, X, Plus, Info } from "lucide-react";

type RuleType = 'cart_value' | 'day_of_week' | 'first_visit' | 'new_customer' | 'returning_customer';
type Operator = 'greater_than' | 'less_than' | 'equals' | 'includes' | 'excludes';

interface Rule {
  id: string;
  type: RuleType;
  operator?: Operator;
  value: string | number | string[];
}

interface RuleBuilderProps {
  initialRules?: Rule[];
  onChange?: (rules: Rule[]) => void;
}

const RULE_TYPES: { value: RuleType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'cart_value',
    label: 'Valor del carrito',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'El total del carrito supera/no supera un valor'
  },
  {
    value: 'day_of_week',
    label: 'Día de la semana',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Solo ciertos días de la semana'
  },
  {
    value: 'first_visit',
    label: 'Primera visita',
    icon: <UserPlus className="w-5 h-5" />,
    description: 'Solo visitantes nuevos'
  },
  {
    value: 'new_customer',
    label: 'Cliente nuevo',
    icon: <User className="w-5 h-5" />,
    description: 'Usuario que no ha comprado antes'
  },
  {
    value: 'returning_customer',
    label: 'Cliente recurrente',
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'Usuario con compras previas'
  }
];

const DAY_OPTIONS = [
  { value: '1', label: 'Lun', fullLabel: 'Lunes' },
  { value: '2', label: 'Mar', fullLabel: 'Martes' },
  { value: '3', label: 'Mié', fullLabel: 'Miércoles' },
  { value: '4', label: 'Jue', fullLabel: 'Jueves' },
  { value: '5', label: 'Vie', fullLabel: 'Viernes' },
  { value: '6', label: 'Sáb', fullLabel: 'Sábado' },
  { value: '0', label: 'Dom', fullLabel: 'Domingo' }
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function RuleBuilder({ initialRules = [], onChange }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [isAdding, setIsAdding] = useState(false);

  const updateRules = useCallback((newRules: Rule[]) => {
    setRules(newRules);
    onChange?.(newRules);
  }, [onChange]);

  const addRule = (type: RuleType) => {
    const defaultValues: Record<RuleType, Partial<Omit<Rule, 'id' | 'type'>>> = {
      cart_value: { operator: 'greater_than' as Operator, value: 50 },
      day_of_week: { value: ['1', '2', '3', '4', '5'] },
      first_visit: { value: true as unknown as string },
      new_customer: { value: true as unknown as string },
      returning_customer: { value: true as unknown as string }
    };

    const newRule: Rule = {
      id: generateId(),
      type,
      value: '',
      ...defaultValues[type]
    };

    updateRules([...rules, newRule]);
    setIsAdding(false);
  };

  const removeRule = (id: string) => {
    updateRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    updateRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleDay = (ruleId: string, day: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !Array.isArray(rule.value)) return;

    const newDays = rule.value.includes(day)
      ? rule.value.filter(d => d !== day)
      : [...rule.value, day];
    
    updateRule(ruleId, { value: newDays });
  };

  const getRuleDescription = (rule: Rule): string => {
    switch (rule.type) {
      case 'cart_value':
        const op = rule.operator === 'greater_than' ? 'supera' : 
                   rule.operator === 'less_than' ? 'es menor que' : 'es igual a';
        return `El carrito ${op} €${rule.value}`;
      case 'day_of_week':
        const days = (rule.value as string[])
          .map(d => DAY_OPTIONS.find(opt => opt.value === d)?.fullLabel)
          .filter(Boolean);
        return days.length === 7 ? 'Cualquier día' : 
               days.length === 0 ? 'Ningún día (desactivado)' : 
               `Los ${days.join(', ')}`;
      case 'first_visit':
        return 'Es la primera visita del usuario';
      case 'new_customer':
        return 'El usuario no ha realizado compras';
      case 'returning_customer':
        return 'El usuario ha comprado anteriormente';
      default:
        return 'Regla personalizada';
    }
  };

  const getNaturalLanguageSummary = (): string => {
    if (rules.length === 0) return 'Se mostrará siempre (sin condiciones)';
    
    const descriptions = rules.map(getRuleDescription);
    
    if (descriptions.length === 1) {
      return `Se muestra cuando: ${descriptions[0]}`;
    }
    
    const allButLast = descriptions.slice(0, -1).join(', ');
    const last = descriptions[descriptions.length - 1];
    return `Se muestra cuando: ${allButLast} Y ${last}`;
  };

  return (
    <div className="space-y-4">
      {/* Existing Rules */}
      {rules.length > 0 && (
        <div className="space-y-3">
          {rules.map((rule, idx) => {
            const ruleType = RULE_TYPES.find(t => t.value === rule.type);
            
            return (
              <div key={rule.id} className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ruleType?.icon}</span>
                    <div>
                      <div className="font-medium">{ruleType?.label}</div>
                      <div className="text-xs text-muted-foreground">{ruleType?.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar regla"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rule Configuration */}
                <div className="mt-4">
                  {rule.type === 'cart_value' && (
                    <div className="flex items-center gap-3">
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value as Operator })}
                        className="admin-input py-1.5"
                      >
                        <option value="greater_than">Supera</option>
                        <option value="less_than">Es menor que</option>
                        <option value="equals">Es igual a</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">€</span>
                        <input
                          type="number"
                          value={rule.value as number}
                          onChange={(e) => updateRule(rule.id, { value: parseFloat(e.target.value) || 0 })}
                          className="admin-input py-1.5 w-24"
                          min="0"
                          step="5"
                        />
                      </div>
                    </div>
                  )}

                  {rule.type === 'day_of_week' && (
                    <div className="flex flex-wrap gap-2">
                      {DAY_OPTIONS.map((day) => {
                        const isSelected = (rule.value as string[]).includes(day.value);
                        return (
                          <button
                            key={day.value}
                            onClick={() => toggleDay(rule.id, day.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {['first_visit', 'new_customer', 'returning_customer'].includes(rule.type) && (
                    <div className="text-sm text-muted-foreground italic">
                      Esta regla no requiere configuración adicional.
                    </div>
                  )}
                </div>

                {/* AND connector for next rule */}
                {idx < rules.length - 1 && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                      Y
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Rule Button / Selector */}
      {isAdding ? (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Añadir condición</h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RULE_TYPES.map((type) => {
              const alreadyAdded = rules.some(r => r.type === type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => !alreadyAdded && addRule(type.value)}
                  disabled={alreadyAdded}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    alreadyAdded
                      ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <span className="text-xl text-primary">{type.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    {alreadyAdded && (
                      <div className="text-xs text-muted-foreground">Ya añadida</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {rules.length === 0 ? 'Añadir condición (opcional)' : 'Añadir otra condición'}
        </button>
      )}

      {/* Natural Language Preview */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-400 mb-1">Vista previa de la regla</div>
            <div className="text-sm text-muted-foreground">
              {getNaturalLanguageSummary()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
