using Microsoft.Data.Sqlite;
using System.Data;

namespace OceanFriendlyProductFinder.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException("Connection string not found");
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // Create Users table
            var createUsersTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT UNIQUE NOT NULL,
                    Email TEXT UNIQUE NOT NULL,
                    PasswordHash TEXT NOT NULL,
                    SensitivityPreferences TEXT,
                    IsAdmin BOOLEAN DEFAULT 0,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )";

            // Create Ingredients table
            var createIngredientsTable = @"
                CREATE TABLE IF NOT EXISTS Ingredients (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT UNIQUE NOT NULL,
                    IsReefSafe BOOLEAN DEFAULT 0,
                    BiodegradabilityScore INTEGER CHECK(BiodegradabilityScore >= 0 AND BiodegradabilityScore <= 100),
                    CoralSafetyScore INTEGER CHECK(CoralSafetyScore >= 0 AND CoralSafetyScore <= 100),
                    FishSafetyScore INTEGER CHECK(FishSafetyScore >= 0 AND FishSafetyScore <= 100),
                    CoverageScore INTEGER CHECK(CoverageScore >= 0 AND CoverageScore <= 100),
                    Description TEXT,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )";

            // Create Products table
            var createProductsTable = @"
                CREATE TABLE IF NOT EXISTS Products (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Brand TEXT NOT NULL,
                    Category TEXT NOT NULL,
                    Description TEXT,
                    ImageUrl TEXT,
                    ExternalLink TEXT,
                    OceanScore INTEGER CHECK(OceanScore >= 1 AND OceanScore <= 100),
                    BiodegradabilityScore INTEGER CHECK(BiodegradabilityScore >= 0 AND BiodegradabilityScore <= 100),
                    CoralSafetyScore INTEGER CHECK(CoralSafetyScore >= 0 AND CoralSafetyScore <= 100),
                    FishSafetyScore INTEGER CHECK(FishSafetyScore >= 0 AND FishSafetyScore <= 100),
                    CoverageScore INTEGER CHECK(CoverageScore >= 0 AND CoverageScore <= 100),
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )";

            // Create ProductIngredients junction table
            var createProductIngredientsTable = @"
                CREATE TABLE IF NOT EXISTS ProductIngredients (
                    ProductId INTEGER,
                    IngredientId INTEGER,
                    PRIMARY KEY (ProductId, IngredientId),
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
                    FOREIGN KEY (IngredientId) REFERENCES Ingredients(Id) ON DELETE CASCADE
                )";

            // Create UserFavorites table
            var createUserFavoritesTable = @"
                CREATE TABLE IF NOT EXISTS UserFavorites (
                    UserId INTEGER,
                    ProductId INTEGER,
                    PRIMARY KEY (UserId, ProductId),
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
                )";

            // Create AnalyticsLog table
            var createAnalyticsLogTable = @"
                CREATE TABLE IF NOT EXISTS AnalyticsLog (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    UserId INTEGER,
                    ProductId INTEGER,
                    Action TEXT NOT NULL,
                    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE SET NULL
                )";

            // Create OceanScoreWeights table for admin configuration
            var createOceanScoreWeightsTable = @"
                CREATE TABLE IF NOT EXISTS OceanScoreWeights (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    BiodegradabilityWeight REAL DEFAULT 0.3,
                    CoralSafetyWeight REAL DEFAULT 0.3,
                    FishSafetyWeight REAL DEFAULT 0.25,
                    CoverageWeight REAL DEFAULT 0.15,
                    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )";

            var commands = new[] {
                createUsersTable,
                createIngredientsTable,
                createProductsTable,
                createProductIngredientsTable,
                createUserFavoritesTable,
                createAnalyticsLogTable,
                createOceanScoreWeightsTable
            };

            foreach (var command in commands)
            {
                using var cmd = new SqliteCommand(command, connection);
                cmd.ExecuteNonQuery();
            }

            // Insert default admin user
            InsertDefaultAdmin(connection);
            
            // Insert default Ocean Score weights
            InsertDefaultWeights(connection);
        }

        private void InsertDefaultAdmin(SqliteConnection connection)
        {
            var checkAdmin = "SELECT COUNT(*) FROM Users WHERE IsAdmin = 1";
            using var checkCmd = new SqliteCommand(checkAdmin, connection);
            var adminCount = Convert.ToInt32(checkCmd.ExecuteScalar());

            if (adminCount == 0)
            {
                var insertAdmin = @"
                    INSERT INTO Users (Username, Email, PasswordHash, IsAdmin)
                    VALUES ('admin', 'admin@oceanfriendly.com', 'admin123', 1)";
                
                using var insertCmd = new SqliteCommand(insertAdmin, connection);
                insertCmd.ExecuteNonQuery();
            }
        }

        private void InsertDefaultWeights(SqliteConnection connection)
        {
            var checkWeights = "SELECT COUNT(*) FROM OceanScoreWeights";
            using var checkCmd = new SqliteCommand(checkWeights, connection);
            var weightsCount = Convert.ToInt32(checkCmd.ExecuteScalar());

            if (weightsCount == 0)
            {
                var insertWeights = @"
                    INSERT INTO OceanScoreWeights (BiodegradabilityWeight, CoralSafetyWeight, FishSafetyWeight, CoverageWeight)
                    VALUES (0.3, 0.3, 0.25, 0.15)";
                
                using var insertCmd = new SqliteCommand(insertWeights, connection);
                insertCmd.ExecuteNonQuery();
            }
        }

        public IDbConnection GetConnection()
        {
            return new SqliteConnection(_connectionString);
        }
    }
}

