# 🗄️ Database Setup & Documentation

Your dashboard now has **real database integration** using **Cloudflare D1** (SQLite) with **Drizzle ORM**!

## 📊 Database Schema

### Tables

1. **projects**
   - `id` (text, primary key)
   - `name` (text)
   - `client` (text)
   - `status` (enum: 'active', 'completed', 'on-hold', 'planning')
   - `budget` (real/float)
   - `spent` (real/float)
   - `start_date` (text/ISO date)
   - `end_date` (text/ISO date)
   - `progress` (integer 0-100)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **invoices**
   - `id` (text, primary key)
   - `project_id` (text, foreign key → projects.id)
   - `project_name` (text)
   - `amount` (real/float)
   - `status` (enum: 'paid', 'pending', 'overdue')
   - `due_date` (text/ISO date)
   - `issue_date` (text/ISO date)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **contacts**
   - `id` (text, primary key)
   - `name` (text)
   - `email` (text)
   - `phone` (text)
   - `company` (text)
   - `role` (text)
   - `projects` (text, JSON array of project IDs)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 🚀 API Endpoints

All data is accessed through REST API routes:

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/[id]` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/[id]` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/[id]` - Get single contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

## 🛠️ Database Commands

### Initial Setup (Already Done!)
```bash
npm run db:generate    # Generate migration files
npm run db:migrate     # Run migrations (create tables)
npm run db:seed        # Populate with sample data
```

### Reset Database
If you want to start fresh:
```bash
# Delete the local database
rm -rf .wrangler/state/v3/d1

# Re-run setup
npm run db:migrate
npm run db:seed
```

### View Database (Drizzle Studio)
```bash
npm run db:studio
```
This opens a visual database browser at http://localhost:4983

### Execute Custom SQL
```bash
npx wrangler d1 execute DB --command "SELECT * FROM projects;" --local
```

## 🔄 Data Flow

1. **Frontend Component** (`ProjectDashboard.tsx`)
   - Fetches data from API routes on mount
   - Updates state when data changes
   - Sends updates to API routes

2. **API Routes** (`/src/pages/api/*`)
   - Handle HTTP requests (GET, POST, PUT, DELETE)
   - Use Drizzle ORM to query database
   - Return JSON responses

3. **Database Layer** (`/src/db/*`)
   - Schema definitions (Drizzle)
   - Database connection helper
   - Type safety with TypeScript

## 📝 Current Features

✅ **Data Persistence** - All changes are saved to the database  
✅ **Full CRUD Operations** - Create, Read, Update, Delete for all entities  
✅ **Real-time Updates** - Status changes (e.g., invoice status) update immediately  
✅ **Type Safety** - Full TypeScript support throughout  
✅ **Local Development** - Uses local D1 database (SQLite)  

## 🚀 Next Steps for Production

When you're ready to deploy:

1. **Create Production Database**
   ```bash
   npx wrangler d1 create project-management-db
   ```

2. **Update wrangler.jsonc** with the production database ID

3. **Run Production Migrations**
   ```bash
   npx wrangler d1 execute DB --file=./drizzle/0000_foamy_steel_serpent.sql --remote
   npx wrangler d1 execute DB --file=./drizzle/seed.sql --remote
   ```

4. **Deploy**
   ```bash
   npm run build
   npx wrangler deploy
   ```

## 🔐 Security Notes

- API routes currently have no authentication
- Anyone can read/write data
- Add authentication before production use
- Consider implementing:
  - API keys
  - JWT tokens
  - Role-based access control (RBAC)
  - Rate limiting

## 📚 Technologies Used

- **Cloudflare D1** - SQLite-compatible serverless database
- **Drizzle ORM** - TypeScript ORM for type-safe queries
- **Astro API Routes** - Server-side endpoints
- **React** - Frontend UI component

## 🆘 Troubleshooting

### Database not found?
Run `npm run db:migrate` to create tables

### No data showing?
Run `npm run db:seed` to populate with sample data

### Changes not saving?
Check browser console for API errors

### Type errors?
Run `npm run astro check` to see TypeScript issues
