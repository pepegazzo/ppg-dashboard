
-- Seed data for Companies (insert first)
INSERT INTO companies (id, name, legal_name, tax_id, industry, website, phone, address, logo, created_at, updated_at) VALUES
('comp-1', 'Acme Corp', 'Acme Corporation S.A.C.', '20123456789', 'Tecnología', 'https://acmecorp.com', '+1 (555) 100-2000', '123 Tech Street, Silicon Valley, CA', null, unixepoch(), unixepoch()),
('comp-2', 'TechStart Inc', 'TechStart Innovations E.I.R.L.', '20987654321', 'Software', 'https://techstart.io', '+1 (555) 200-3000', '456 Innovation Ave, San Francisco, CA', null, unixepoch(), unixepoch()),
('comp-3', 'Creative Studios', 'Creative Studios Group S.A.', '20456789123', 'Diseño', 'https://creativestudios.com', '+1 (555) 300-4000', '789 Design Blvd, Los Angeles, CA', null, unixepoch(), unixepoch()),
('comp-4', 'Retail Pro', 'Retail Professional Services S.R.L.', '20321654987', 'E-commerce', 'https://retailpro.com', '+1 (555) 400-5000', '321 Commerce Lane, New York, NY', null, unixepoch(), unixepoch());

-- Seed data for Contacts (with company_id references)
INSERT INTO contacts (id, company_id, name, last_name, email, phone, company, role, projects, created_at, updated_at) VALUES
('1', 'comp-1', 'John', 'Smith', 'john.smith@acmecorp.com', '+1 (555) 123-4567', 'Acme Corp', 'Project Manager', '["1"]', unixepoch(), unixepoch()),
('2', 'comp-2', 'Sarah', 'Johnson', 'sarah.j@techstart.io', '+1 (555) 234-5678', 'TechStart Inc', 'CTO', '["2"]', unixepoch(), unixepoch()),
('3', 'comp-3', 'Mike', 'Davis', 'mike@creativestudios.com', '+1 (555) 345-6789', 'Creative Studios', 'Creative Director', '["3"]', unixepoch(), unixepoch()),
('4', 'comp-4', 'Emily', 'Chen', 'emily.chen@retailpro.com', '+1 (555) 456-7890', 'Retail Pro', 'VP of Marketing', '["4"]', unixepoch(), unixepoch()),
('5', 'comp-1', 'Pepe', 'Lazzo', 'pepe.lazzo@acmecorp.com', '+51 999 888 777', 'Acme Corp', 'CEO', '[]', unixepoch(), unixepoch()),
('6', 'comp-1', 'Pito', 'Limpiador', 'pito.limpiador@acmecorp.com', '+51 888 777 666', 'Acme Corp', 'CFO', '[]', unixepoch(), unixepoch());

-- Seed data for Projects (with contactId references)
INSERT INTO projects (id, name, client, contact_id, status, budget, spent, start_date, end_date, progress, created_at, updated_at) VALUES
('1', 'Website Redesign', 'Acme Corp', '1', 'active', 50000, 32000, '2024-01-15', '2024-03-30', 64, unixepoch(), unixepoch()),
('2', 'Mobile App Development', 'TechStart Inc', '2', 'active', 120000, 45000, '2024-02-01', '2024-06-30', 38, unixepoch(), unixepoch()),
('3', 'Brand Identity', 'Creative Studios', '3', 'completed', 25000, 24500, '2023-11-01', '2024-01-15', 100, unixepoch(), unixepoch()),
('4', 'E-commerce Platform', 'Retail Pro', '4', 'planning', 80000, 5000, '2024-03-01', '2024-08-30', 6, unixepoch(), unixepoch());

-- Seed data for Invoices with new fields
INSERT INTO invoices (id, project_id, project_name, amount, status, due_date, issue_date, items, subtotal, retention, notes, created_at, updated_at) VALUES
('INV-001', '1', 'Website Redesign', 15000, 'paid', '2024-02-15', '2024-02-01', '[{"serviceName":"Diseño UI/UX","description":"Diseño completo de interfaz de usuario","unitPrice":5000,"quantity":2,"total":10000},{"serviceName":"Desarrollo Frontend","description":"Implementación HTML/CSS/JS","unitPrice":2500,"quantity":2,"total":5000}]', 13761.47, 1238.53, 'Primera factura - Diseño y desarrollo inicial', unixepoch(), unixepoch()),
('INV-002', '2', 'Mobile App Development', 30000, 'pending', '2024-03-01', '2024-02-15', '[{"serviceName":"Desarrollo iOS","description":"Aplicación nativa iOS","unitPrice":15000,"quantity":1,"total":15000},{"serviceName":"Desarrollo Android","description":"Aplicación nativa Android","unitPrice":15000,"quantity":1,"total":15000}]', 27522.94, 2477.06, 'Fase 1 - Desarrollo de aplicaciones móviles', unixepoch(), unixepoch()),
('INV-003', '1', 'Website Redesign', 17000, 'overdue', '2024-01-30', '2024-01-15', '[{"serviceName":"Testing y QA","description":"Pruebas de calidad y correcciones","unitPrice":3000,"quantity":2,"total":6000},{"serviceName":"Deployment","description":"Puesta en producción","unitPrice":5500,"quantity":2,"total":11000}]', 15596.33, 1403.67, 'Segunda factura - Testing y deployment', unixepoch(), unixepoch());

