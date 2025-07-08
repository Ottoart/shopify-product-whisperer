# Shopify Product Manager

AI-powered batch product optimization tool with full Shopify integration.

## Features

- 📥 **Import Products**: Import from CSV or directly from your Shopify store
- 🤖 **AI Optimization**: Enhance product titles, descriptions, and tags
- 🔄 **Shopify Sync**: Two-way sync with your Shopify store
- 📊 **Batch Processing**: Handle multiple products efficiently
- 🔐 **Secure**: User authentication and data isolation

## Shopify Setup

To connect your Shopify store, you'll need:

1. **Store Domain**: Your store's domain (e.g., `my-store.myshopify.com`)
2. **Admin API Access Token**: Generate from your Shopify admin panel

### Getting Your Shopify API Credentials

1. Go to your Shopify Admin panel
2. Navigate to Apps → Develop apps → Create an app
3. Configure Admin API access scopes:
   - `read_products`
   - `write_products`
4. Generate and copy your Admin API access token

## Usage

1. Sign up or log in to the application
2. Configure your Shopify credentials in the secrets
3. Import products from Shopify or upload a CSV
4. Select products for AI optimization
5. Process products through the queue
6. Export updated products back to Shopify

## Development

Built with:
- React + TypeScript
- Supabase (Database + Auth + Edge Functions)
- Tailwind CSS + Shadcn UI
- Shopify Admin API

## Project info

**URL**: https://lovable.dev/projects/751c8744-5cc2-4126-b021-cefc67bc436e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/751c8744-5cc2-4126-b021-cefc67bc436e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/751c8744-5cc2-4126-b021-cefc67bc436e) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
