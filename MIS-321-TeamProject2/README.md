# Ocean-Friendly Product Finder 🌊

A full-stack web application that helps consumers make informed choices about personal care products that protect our oceans and marine ecosystems. This project supports the United Nations' Sustainable Development Goal #14: Life Below Water.

## Technology Stack

### Frontend
- **HTML/CSS**: Single-page application with Bootstrap 5.3.0 from CDN
- **JavaScript**: Vanilla ES6+ JavaScript (no frameworks)
- **Styling**: Bootstrap 5.x with custom CSS enhancements

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8.0)
- **Language**: C#
- **Architecture**: RESTful API with proper HTTP methods and status codes

### Database
- **Type**: SQLite
- **Data Access**: Direct SQL queries (no ORM)
- **Location**: `./api/database.db`
- **Seed Data**: Automatically populated on first run with sample products and ingredients

## Project Structure

```
MIS-321-TeamProject2/
├── api/                                    # Backend API
│   ├── Controllers/                        # API Controllers
│   │   ├── AdminController.cs             # Admin management endpoints
│   │   ├── AnalyticsController.cs         # Analytics and reporting
│   │   ├── IngredientsController.cs       # Ingredient CRUD operations
│   │   └── ProductsController.cs          # Product search and management
│   ├── Models/                            # Data models
│   │   ├── Analytics.cs                   # Analytics models
│   │   ├── Ingredient.cs                  # Ingredient models
│   │   ├── OceanScore.cs                  # Ocean Score models
│   │   ├── Product.cs                     # Product models
│   │   └── User.cs                        # User models
│   ├── Services/                          # Business logic services
│   │   ├── DatabaseService.cs             # Database initialization and connections
│   │   ├── OceanScoreService.cs           # Ocean Score calculation algorithm
│   │   └── SeedDataService.cs             # Initial data seeding
│   ├── appsettings.json                   # Application configuration
│   ├── Program.cs                         # Application entry point
│   └── OceanFriendlyProductFinder.csproj  # Project file
├── frontend/                               # Frontend application
│   ├── assets/                            # Static assets
│   │   └── logo/                          # Logo images
│   │       ├── Logo.png
│   │       └── main-logo.png
│   ├── js/                                # JavaScript files
│   │   └── app.js                         # Main application logic
│   └── index.html                         # Single-page application
└── README.md                              # This file
```

## Features

### User Features
- **Product Search**: Search products by name, brand, category, or ocean score
- **Ocean Score System**: Products rated 1-100 based on environmental impact
- **Detailed Product Information**: View ingredients, scores, and safety levels
- **Favorites**: Save favorite ocean-friendly products locally
- **Score Breakdown**: See biodegradability, coral safety, fish safety, and coverage scores

### Admin Features
- **Product Management**: Create, read, update, and delete products
- **Ingredient Management**: Manage ingredient database
- **User Management**: View registered users
- **Analytics Dashboard**: View search trends, popular products, and category statistics
- **Weight Configuration**: Adjust Ocean Score algorithm weights

### Ocean Score Algorithm
The Ocean Score (1-100) is calculated using a weighted average of four factors:
- **Biodegradability** (default 30%): How quickly ingredients break down naturally
- **Coral Safety** (default 30%): Impact on coral reef health
- **Fish Safety** (default 25%): Effect on marine fish and wildlife
- **Coverage** (default 15%): Overall environmental impact

**Safety Levels:**
- **Safe (80-100)**: Ocean-friendly, safe for marine environments
- **Moderate (50-79)**: Mixed environmental impact
- **Harmful (1-49)**: May harm marine life and coral reefs

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor or IDE (Visual Studio, VS Code, or Rider)

### Installation & Setup

1. **Clone the repository**
   ```bash
   cd MIS-321-TeamProject2/MIS-321-TeamProject2
   ```

2. **Backend Setup**
   ```bash
   cd api
   dotnet restore
   dotnet build
   ```

3. **Run the Backend API**
   ```bash
   dotnet run
   ```
   
   The API will start on `https://localhost:7001` by default.
   
   On first run, the application will:
   - Create the SQLite database at `./api/database.db`
   - Create all necessary tables
   - Seed initial data (ingredients and products)
   - Create a default admin user (username: `admin`, password: `admin123`)

4. **Configure Frontend**
   
   Open `frontend/js/app.js` and verify the API_BASE constant:
   ```javascript
   const API_BASE = 'https://localhost:7001/api';
   ```

5. **Run the Frontend**
   
   Open `frontend/index.html` in a web browser. You can:
   - Double-click the file
   - Use a local development server (recommended):
     ```bash
     cd frontend
     # Python 3
     python -m http.server 8000
     # Or use VS Code's Live Server extension
     ```

6. **Access the Application**
   - Frontend: `http://localhost:8000` (if using a local server) or open `index.html` directly
   - API Swagger: `https://localhost:7001/swagger`

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## API Endpoints

### Products
- `GET /api/products` - Search products with filters
- `GET /api/products/{id}` - Get product details
- `GET /api/products/{id}/ocean-score` - Get Ocean Score breakdown
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/{id}` - Get ingredient details
- `POST /api/ingredients` - Create new ingredient (admin)
- `PUT /api/ingredients/{id}` - Update ingredient (admin)
- `DELETE /api/ingredients/{id}` - Delete ingredient (admin)

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/ocean-score-weights` - Get current weights
- `PUT /api/admin/ocean-score-weights` - Update weights
- `POST /api/admin/recalculate-scores` - Recalculate all product scores

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/analytics/log` - Log user action
- `GET /api/analytics/export/csv` - Export analytics as CSV

## Development Guidelines

### Code Style
- **C#**: 4 spaces indentation, PascalCase for classes, camelCase for variables
- **JavaScript**: 2 spaces indentation, camelCase for variables and functions
- **HTML/CSS**: 2 spaces indentation

### Best Practices
- Use async/await for all API calls
- Implement proper error handling in both frontend and backend
- Use Bootstrap classes extensively, minimize custom CSS
- Follow REST API conventions
- Write clear, readable code with appropriate comments

## Database Schema

### Tables
- **Users**: User accounts and admin flags
- **Products**: Product information and ocean scores
- **Ingredients**: Ingredient data and safety scores
- **ProductIngredients**: Many-to-many relationship between products and ingredients
- **UserFavorites**: User's favorite products
- **AnalyticsLog**: User actions for analytics
- **OceanScoreWeights**: Configurable algorithm weights

## Troubleshooting

### API Connection Issues
1. Ensure the backend API is running (`dotnet run` in api folder)
2. Check the API_BASE URL in `frontend/js/app.js` matches your API URL
3. Verify CORS is enabled in the API (it should be by default)
4. Check browser console for error messages

### Database Issues
1. Delete `api/database.db` and restart the API to recreate the database
2. Check file permissions on the api folder

### Port Conflicts
If ports 7001 or 5000 are already in use:
1. Edit `api/Properties/launchSettings.json` to use different ports
2. Update `API_BASE` in `frontend/js/app.js` to match

## Testing

### Manual Testing
1. Test product search with various filters
2. View product details and verify Ocean Score calculations
3. Add/remove products from favorites
4. Test admin login and product management
5. Verify analytics tracking

### API Testing
Use Swagger UI at `https://localhost:7001/swagger` to test API endpoints directly.

## Future Enhancements

Potential features for future development:
- User authentication and registration
- User reviews and ratings
- Product recommendations based on preferences
- Mobile-responsive design improvements
- Advanced analytics with charts
- Barcode scanning for product lookup
- Social sharing features
- Export favorites as PDF

## Contributing

This is an educational project for MIS 321. For contributions:
1. Follow the established code style
2. Test all changes thoroughly
3. Update documentation as needed
4. Keep the technology stack consistent with project requirements

## UN Sustainable Development Goal #14

This project supports UN SDG #14: Life Below Water, which aims to conserve and sustainably use the oceans, seas, and marine resources for sustainable development.

**Targets addressed:**
- 14.1: Reduce marine pollution
- 14.2: Protect and restore ecosystems
- 14.5: Conserve coastal and marine areas

## License

This project is created for educational purposes as part of MIS 321 coursework.

## Contact & Support

For questions or issues:
- Check the Swagger API documentation
- Review the browser console for error messages
- Verify all prerequisites are installed correctly

---

**Built with 💙 for the ocean and marine life**
