import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface CompanyFormProps {
  company?: { 
    name: string; 
    ruc?: string | null; 
    phone?: string | null; 
    email?: string | null; 
    website?: string | null; 
    address?: string | null;
  } | null;
  onSubmit: (data: { name: string; ruc?: string; phone?: string; email?: string; website?: string; address?: string; contactName?: string; contactPhone?: string; contactEmail?: string }) => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    ruc: company?.ruc || '',
    phone: company?.phone || '',
    email: company?.email || '',
    website: company?.website || '',
    address: company?.address || '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Información de la Empresa</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Acme Corp"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input
              id="ruc"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              placeholder="Ej: 20123456789"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company-phone">Teléfono</Label>
            <Input
              id="company-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: +51 999 999 999"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company-email">Correo Electrónico</Label>
            <Input
              id="company-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: contacto@empresa.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Ej: https://www.empresa.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ej: Av. Principal 123, Lima"
            />
          </div>
        </div>
      </div>

      {!company && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contacto Inicial (Opcional)</h3>
            <p className="text-sm text-muted-foreground">
              Puedes agregar un contacto ahora o hacerlo más tarde
            </p>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Nombre del Contacto</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Teléfono del Contacto</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="Ej: +51 999 999 999"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email del Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="Ej: juan@empresa.com"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {company ? 'Actualizar Cliente' : 'Agregar Cliente'}
        </Button>
      </div>
    </form>
  );
}

