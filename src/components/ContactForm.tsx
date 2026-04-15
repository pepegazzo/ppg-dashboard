import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ContactFormProps {
  contact?: { id: string; name: string; phone?: string; email?: string; company: string } | null;
  companyName: string;
  onSubmit: (data: { name: string; phone?: string; email?: string; company: string }) => void;
  onCancel: () => void;
}

export function ContactForm({ contact, companyName, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    phone: contact?.phone || '',
    email: contact?.email || '',
    company: companyName
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">Nombre *</Label>
          <Input
            id="contact-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-phone">Teléfono</Label>
          <Input
            id="contact-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Ej: +51 999 999 999"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email">Correo Electrónico</Label>
          <Input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Ej: juan@empresa.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={formData.company}
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {contact ? 'Actualizar Contacto' : 'Agregar Contacto'}
        </Button>
      </div>
    </form>
  );
}
