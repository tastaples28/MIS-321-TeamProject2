# 🌊 Ocean-Friendly Product Finder

A full-stack web application that helps users identify ocean-safe personal care products and understand their environmental impact. This app supports the **UN Sustainable Development Goal #14: Life Below Water**.

## 🎯 Project Overview

**Problem:** Consumers lack transparency on how their daily personal care products affect coral reefs and marine ecosystems.

**Solution:** A web app that allows users to search, rate, and learn about products through an **Ocean Score (1–100)** system based on biodegradability, coral safety, and fish safety.

## ✨ Features

### 🔍 Product Search & Scoring
- Search by product name, brand, or category
- Advanced filters for ingredients and Ocean Score range
- Color-coded safety indicators (green = safe, yellow = moderate, red = harmful)
- Ocean Score breakdown showing individual component scores
- Product favorites and external links

### 👤 User Management
- User profiles with sensitivity preferences
- Favorites system for saving preferred products
- Analytics tracking for user behavior

### 🔧 Admin Dashboard
- CRUD operations for products, ingredients, and users
- Ocean Score algorithm weight management
- Analytics dashboard with visual charts
- CSV export functionality
- Homepage content management

### 📊 Analytics & Reporting
- Track product views, searches, and favorites
- Top-rated eco products analysis
- Most harmful ingredients identification
- Average Ocean Score per category
- Export analytics as CSV

## 🛠️ Technology Stack

### Frontend
- **HTML/CSS**: Single-page application with Bootstrap 5.x styling
- **JavaScript**: Vanilla JavaScript (ES6+) with DOM manipulation
- **UI Framework**: Bootstrap 5.x from CDN
- **Icons**: Font Awesome 6.0

### Backend
- **Framework**: .NET 8.0 Web API
- **Language**: C#
- **Database**: SQLite with direct SQL queries
- **Architecture**: RESTful API design

## 🚀 Getting Started

### Prerequisites
- .NET 8.0 SDK
- Visual Studio 2022 or VS Code
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MIS-321-TeamProject2
   ```

2. **Navigate to the API directory**
   ```bash
   cd api
   ```

3. **Restore dependencies**
   ```bash
   dotnet restore
   ```

4. **Run the API server**
   ```bash
   dotnet run
   ```

5. **Open the frontend**
   Open `frontend/index.html` in your web browser, or serve it using a local web server

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🏗️ Project Structure

```
MIS-321-TeamProject2/
├── api/                          # Backend API
│   ├── Controllers/              # API Controllers
│   │   ├── ProductsController.cs
│   │   ├── IngredientsController.cs
│   │   ├── AdminController.cs
│   │   └── AnalyticsController.cs
│   ├── Models/                   # Data Models
│   │   ├── User.cs
│   │   ├── Product.cs
│   │   ├── Ingredient.cs
│   │   ├── OceanScore.cs
│   │   └── Analytics.cs
│   ├── Services/                # Business Logic
│   │   ├── DatabaseService.cs
│   │   ├── OceanScoreService.cs
│   │   └── SeedDataService.cs
│   ├── Program.cs               # Application entry point
│   ├── appsettings.json         # Configuration
│   └── OceanFriendlyProductFinder.csproj
├── frontend/                    # Frontend files
│   ├── index.html              # Main HTML file
│   └── js/
│       └── app.js              # JavaScript application logic
└── README.md                   # This file
```

## 🧮 Ocean Score Algorithm

The Ocean Score (1-100) is calculated using a weighted algorithm:

- **Biodegradability** (30%): How quickly ingredients break down naturally
- **Coral Safety** (30%): Impact on coral reef health
- **Fish Safety** (25%): Effect on marine fish and wildlife
- **Coverage** (15%): Overall environmental impact assessment

### Safety Levels
- **Safe (80-100)**: Green badge - Ocean-friendly products
- **Moderate (50-79)**: Yellow badge - Mixed impact products
- **Harmful (1-49)**: Red badge - Products harmful to marine life

## 📊 Sample Data

The application comes pre-loaded with 20 sample products including:

### Eco-Friendly Products (High Ocean Scores)
- Reef-Safe Mineral Sunscreen SPF 30
- Coral-Friendly Face Wash
- Ocean-Safe Shampoo
- Marine-Safe Toothpaste

### Mixed Impact Products (Moderate Ocean Scores)
- Balanced Sunscreen SPF 50
- Daily Face Cleanser
- Hydrating Shampoo

### Harmful Products (Low Ocean Scores)
- Ultra Protection Sunscreen SPF 100
- Deep Clean Face Scrub
- Antibacterial Hand Sanitizer

## 🔌 API Endpoints

### Products
- `GET /api/products` - Search products with filters
- `GET /api/products/{id}` - Get product details
- `GET /api/products/{id}/ocean-score` - Get Ocean Score breakdown
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/{id}` - Get ingredient details
- `POST /api/ingredients` - Create ingredient (Admin)
- `PUT /api/ingredients/{id}` - Update ingredient (Admin)
- `DELETE /api/ingredients/{id}` - Delete ingredient (Admin)

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/ocean-score-weights` - Get Ocean Score weights
- `PUT /api/admin/ocean-score-weights` - Update weights
- `POST /api/admin/recalculate-scores` - Recalculate all scores

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/analytics/log` - Log user action
- `GET /api/analytics/export/csv` - Export analytics as CSV

## 🎨 UI Features

### Design Elements
- Ocean-blue theme with coral reef imagery
- Responsive Bootstrap 5 design
- Wave animations and marine aesthetics
- Color-coded Ocean Score badges
- Interactive product cards with hover effects

### User Experience
- Single-page application with smooth navigation
- Real-time search with instant results
- Modal dialogs for product details
- Favorites system with local storage
- Admin dashboard with comprehensive management tools

## 🔒 Security Features

- Admin authentication system
- Password hashing with BCrypt
- SQL injection prevention
- CORS configuration for API access
- Input validation and error handling

## 📈 Analytics Features

- User behavior tracking
- Product popularity metrics
- Search trend analysis
- Ocean Score distribution
- Export capabilities for reporting

## 🌍 Environmental Impact

This application directly supports:
- **UN SDG #14**: Life Below Water
- Coral reef protection awareness
- Marine ecosystem conservation
- Sustainable consumer choices
- Environmental transparency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for educational purposes as part of MIS-321 Team Project 2.

## 🆘 Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Made with 🌊 for ocean conservation**