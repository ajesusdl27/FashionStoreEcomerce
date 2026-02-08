import { useState, useEffect } from 'react';
import { cleanPhone, cleanPostalCode, sanitizeTextField, sanitizeTextFieldLive } from '@/lib/validators';

interface ProfileData {
  full_name: string;
  phone: string;
  default_address: string;
  default_city: string;
  default_postal_code: string;
  default_country: string;
}

interface Props {
  initialData?: Partial<ProfileData>;
}

export default function ProfileForm({ initialData }: Props) {
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    default_address: '',
    default_city: '',
    default_postal_code: '',
    default_country: 'España'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        default_address: initialData.default_address || '',
        default_city: initialData.default_city || '',
        default_postal_code: initialData.default_postal_code || '',
        default_country: initialData.default_country || 'España'
      }));
    }
  }, [initialData]);

  const updateField = (field: keyof ProfileData, value: string) => {
    let cleanedValue = value;
    
    // Apply cleaning/sanitization based on field type
    if (field === 'phone') {
      cleanedValue = cleanPhone(value);
    } else if (field === 'default_postal_code') {
      cleanedValue = cleanPostalCode(value);
    } else if (field === 'full_name' || field === 'default_address' || field === 'default_city') {
      cleanedValue = sanitizeTextFieldLive(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: cleanedValue }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error desconocido' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' 
            : 'bg-accent/10 border border-accent text-accent'
        }`}>
          {message.text}
        </div>
      )}

      {/* Personal Info Section */}
      <div className="glass border border-border rounded-2xl p-6">
        <h2 className="font-heading text-xl mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información Personal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="612 345 678"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="glass border border-border rounded-2xl p-6">
        <h2 className="font-heading text-xl mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Dirección de Envío por Defecto
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Esta dirección se usará para autocompletar tus datos en el checkout.
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="default_address" className="block text-sm font-medium mb-2">
              Dirección
            </label>
            <input
              type="text"
              id="default_address"
              value={formData.default_address}
              onChange={(e) => updateField('default_address', e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Calle, número, piso..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="default_city" className="block text-sm font-medium mb-2">
                Ciudad
              </label>
              <input
                type="text"
                id="default_city"
                value={formData.default_city}
                onChange={(e) => updateField('default_city', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Madrid"
              />
            </div>

            <div>
              <label htmlFor="default_postal_code" className="block text-sm font-medium mb-2">
                Código Postal
              </label>
              <input
                type="text"
                id="default_postal_code"
                value={formData.default_postal_code}
                onChange={(e) => updateField('default_postal_code', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="28001"
                maxLength={5}
              />
            </div>
          </div>

          <div>
            <label htmlFor="default_country" className="block text-sm font-medium mb-2">
              País
            </label>
            <input
              type="text"
              id="default_country"
              value={formData.default_country}
              onChange={(e) => updateField('default_country', e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="España"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  );
}
