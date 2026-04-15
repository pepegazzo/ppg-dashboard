# 📊 Project Management Dashboard

A full-featured project management and billing dashboard with **real database integration**.

## ✨ Features

- 📈 **Dashboard Overview** - Stats, charts, and quick insights
- 📁 **Project Management** - Track projects, budgets, and progress
- 💰 **Billing & Invoicing** - Manage invoices and payment status
- 👥 **Contact Database** - Client and team contact management
- 🗄️ **Real Database** - Powered by Cloudflare D1 (SQLite)
- 🔄 **Full CRUD** - Create, Read, Update, Delete all entities
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Collapsible Sidebar** - Clean navigation with expand/collapse

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database (first time only)
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## 📚 Documentation

See [DATABASE_README.md](./DATABASE_README.md) for complete database documentation including:
- Database schema
- API endpoints
- Database commands
- Production deployment
- Security considerations

## 🛠️ Tech Stack

- **Framework**: Astro 5
- **UI Library**: React 19
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Deployment**: Cloudflare Workers

## 🗄️ Database

Your data is stored in a **real database** (Cloudflare D1). All changes persist across page refreshes and sessions.

### Database Management

```bash
# View database in browser
npm run db:studio

# Reset database
rm -rf .wrangler/state/v3/d1
npm run db:migrate
npm run db:seed

# Execute SQL
npx wrangler d1 execute DB --command "SELECT * FROM projects;" --local
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn UI components
│   └── ProjectDashboard.tsx  # Main dashboard component
├── db/
│   ├── schema.ts        # Database schema
│   └── index.ts         # Database connection
├── pages/
│   ├── api/            # REST API endpoints
│   │   ├── projects/   # Project CRUD
│   │   ├── invoices/   # Invoice CRUD
│   │   └── contacts/   # Contact CRUD
│   └── index.astro     # Home page
└── styles/
    └── global.css      # Global styles
```

## 🎯 Usage

### Summary View
- Dashboard overview with stats
- Recent projects and invoices
- Quick insights

### Projects
- Add, edit, delete projects
- Track budget vs spent
- Monitor progress
- View timelines

### Billing
- Create and manage invoices
- Update invoice status (Paid/Pending/Overdue)
- Track revenue

### Contacts
- Manage client contacts
- Link contacts to projects
- Store contact information

## 🔐 Security Note

⚠️ **Current setup has NO authentication**. Anyone can access and modify data. Before deploying to production:

1. Add authentication (JWT, API keys, etc.)
2. Implement role-based access control
3. Add rate limiting
4. Use environment variables for secrets

## 📦 Deployment

```bash
# Create production database
npx wrangler d1 create project-management-db

# Update wrangler.jsonc with production DB ID

# Run migrations on production
npx wrangler d1 execute DB --file=./drizzle/0000_foamy_steel_serpent.sql --remote
npx wrangler d1 execute DB --file=./drizzle/seed.sql --remote

# Deploy
npm run build
npx wrangler deploy
```

## 🆘 Need Help?

- Check [DATABASE_README.md](./DATABASE_README.md) for database docs
- Run `npm run db:studio` to inspect the database
- Check browser console for API errors
- Run `npm run astro check` for type errors

---

Built with ❤️ using Astro, React, and Cloudflare D1
