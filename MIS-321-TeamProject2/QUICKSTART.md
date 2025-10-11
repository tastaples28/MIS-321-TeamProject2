# Quick Start Guide 🚀

Get the Ocean-Friendly Product Finder running in 3 easy steps!

## Step 1: Start the Backend API

Open a terminal in the project directory and run:

```bash
cd api
dotnet run
```

You should see output like:
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Note:** On first run, the application will automatically:
- Create the database file `database.db` in the `api` folder
- Seed sample products and ingredients
- Create default admin user (username: `admin`, password: `admin123`)

## Step 2: Open the Frontend

In a new terminal window:

```bash
cd frontend
```

Then choose one of these options:

### Option A: Using Python (Recommended)
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser

### Option B: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option C: Direct File Access
Simply double-click `frontend/index.html` to open it in your default browser

## Step 3: Explore the Application

### User Features
1. **Home Page**: Search for ocean-friendly products
2. **Products Page**: Browse and filter products by category, brand, or ocean score
3. **Favorites**: Save your favorite products (stored locally in browser)
4. **About Page**: Learn about the Ocean Score system

### Admin Features
1. Click "Admin" in the navigation
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Explore:
   - Products Management
   - Ingredients Management
   - Users Management
   - Analytics Dashboard
   - Ocean Score Weights Configuration

## Troubleshooting

### "Failed to fetch" errors
- Make sure the backend API is running (Step 1)
- Verify the API URL in `frontend/js/app.js` matches your API (default: https://localhost:7001/api)

### CORS errors
- CORS is enabled by default in the API
- If you still see CORS errors, make sure you're accessing the frontend through a server (Option A or B in Step 2) rather than directly opening the file

### Port already in use
If port 7001 is already in use:
1. Edit `api/Properties/launchSettings.json` to change the port
2. Update the `API_BASE` constant in `frontend/js/app.js` to match

### Database locked errors
- Close any database viewers that might have the file open
- Delete `api/database.db` and restart the API to recreate it

## Testing the Application

Try these actions to test everything works:

1. ✅ Search for "sunscreen" on the home page
2. ✅ Click on a product to view details
3. ✅ Add a product to favorites (heart icon)
4. ✅ Go to Favorites page to see your saved products
5. ✅ Login to admin panel and view analytics
6. ✅ Browse ingredients in the admin panel
7. ✅ Try adjusting Ocean Score weights (admin)

## Sample Data

The application comes pre-loaded with:
- 20 sample ingredients (reef-safe and harmful)
- 20 sample products across multiple categories
- Ocean scores automatically calculated based on ingredients

## Next Steps

- Check out the full [README.md](README.md) for detailed documentation
- Explore the API using Swagger UI at https://localhost:7001/swagger
- Read about the Ocean Score calculation algorithm in the README

---

**Need Help?** Check the browser console (F12) for error messages and review the README.md for detailed troubleshooting.

