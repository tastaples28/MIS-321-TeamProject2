using MySql.Data.MySqlClient;
using System.Data;

namespace OceanFriendlyProductFinder.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            // Handle Heroku's connection string format
            if (string.IsNullOrEmpty(connectionString))
            {
                // Try to get from environment variable (Heroku style)
                connectionString = Environment.GetEnvironmentVariable("CLEARDB_DATABASE_URL") 
                                  ?? Environment.GetEnvironmentVariable("JAWSDB_URL");
                
                if (!string.IsNullOrEmpty(connectionString))
                {
                    // Parse Heroku connection string format
                    var uri = new Uri(connectionString);
                    var connectionStringBuilder = new MySqlConnectionStringBuilder
                    {
                        Server = uri.Host,
                        Port = (uint)uri.Port,
                        Database = uri.AbsolutePath.TrimStart('/'),
                        UserID = uri.UserInfo.Split(':')[0],
                        Password = uri.UserInfo.Split(':')[1],
                        SslMode = MySqlSslMode.Required
                    };
                    _connectionString = connectionStringBuilder.ToString();
                }
                else
                {
                    throw new ArgumentNullException("Connection string not found");
                }
            }
            else
            {
                _connectionString = connectionString;
            }
            
            // Initialize database synchronously to ensure tables are created before seeding
            InitializeDatabase().Wait();
        }

        private async Task InitializeDatabase()
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Create Users table
            var createUsersTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Username VARCHAR(255) UNIQUE NOT NULL,
                    Email VARCHAR(255) UNIQUE NOT NULL,
                    PasswordHash TEXT NOT NULL,
                    SensitivityPreferences TEXT,
                    IsAdmin BOOLEAN DEFAULT FALSE,
                    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";

            // Create Ingredients table
            var createIngredientsTable = @"
                CREATE TABLE IF NOT EXISTS Ingredients (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255) UNIQUE NOT NULL,
                    IsReefSafe BOOLEAN DEFAULT FALSE,
                    BiodegradabilityScore INT CHECK(BiodegradabilityScore >= 0 AND BiodegradabilityScore <= 100),
                    CoralSafetyScore INT CHECK(CoralSafetyScore >= 0 AND CoralSafetyScore <= 100),
                    FishSafetyScore INT CHECK(FishSafetyScore >= 0 AND FishSafetyScore <= 100),
                    CoverageScore INT CHECK(CoverageScore >= 0 AND CoverageScore <= 100),
                    Description TEXT,
                    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";

            // Create Products table
            var createProductsTable = @"
                CREATE TABLE IF NOT EXISTS Products (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255) NOT NULL,
                    Brand VARCHAR(255) NOT NULL,
                    Category VARCHAR(255) NOT NULL,
                    Description TEXT,
                    ImageUrl TEXT,
                    ExternalLink TEXT,
                    OceanScore INT CHECK(OceanScore >= 1 AND OceanScore <= 100),
                    BiodegradabilityScore INT CHECK(BiodegradabilityScore >= 0 AND BiodegradabilityScore <= 100),
                    CoralSafetyScore INT CHECK(CoralSafetyScore >= 0 AND CoralSafetyScore <= 100),
                    FishSafetyScore INT CHECK(FishSafetyScore >= 0 AND FishSafetyScore <= 100),
                    CoverageScore INT CHECK(CoverageScore >= 0 AND CoverageScore <= 100),
                    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )";

            // Create ProductIngredients junction table
            var createProductIngredientsTable = @"
                CREATE TABLE IF NOT EXISTS ProductIngredients (
                    ProductId INT,
                    IngredientId INT,
                    PRIMARY KEY (ProductId, IngredientId),
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
                    FOREIGN KEY (IngredientId) REFERENCES Ingredients(Id) ON DELETE CASCADE
                )";

            // Create UserFavorites table
            var createUserFavoritesTable = @"
                CREATE TABLE IF NOT EXISTS UserFavorites (
                    UserId INT,
                    ProductId INT,
                    PRIMARY KEY (UserId, ProductId),
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
                )";

            // Create AnalyticsLog table
            var createAnalyticsLogTable = @"
                CREATE TABLE IF NOT EXISTS AnalyticsLog (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    UserId INT,
                    ProductId INT,
                    Action VARCHAR(255) NOT NULL,
                    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
                    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE SET NULL
                )";

            // Create OceanScoreWeights table for admin configuration
            var createOceanScoreWeightsTable = @"
                CREATE TABLE IF NOT EXISTS OceanScoreWeights (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    BiodegradabilityWeight DECIMAL(3,2) DEFAULT 0.30,
                    CoralSafetyWeight DECIMAL(3,2) DEFAULT 0.30,
                    FishSafetyWeight DECIMAL(3,2) DEFAULT 0.25,
                    CoverageWeight DECIMAL(3,2) DEFAULT 0.15,
                    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                using var cmd = new MySqlCommand(command, (MySqlConnection)connection);
                cmd.ExecuteNonQuery();
            }

            // Insert default admin user
            InsertDefaultAdmin(connection);
            
            // Insert default Ocean Score weights
            InsertDefaultWeights(connection);
        }

        private void InsertDefaultAdmin(IDbConnection connection)
        {
            var checkAdmin = "SELECT COUNT(*) FROM Users WHERE IsAdmin = 1";
            using var checkCmd = new MySqlCommand(checkAdmin, (MySqlConnection)connection);
            var adminCount = Convert.ToInt32(checkCmd.ExecuteScalar());

            if (adminCount == 0)
            {
                var insertAdmin = @"
                    INSERT INTO Users (Username, Email, PasswordHash, IsAdmin)
                    VALUES ('admin', 'admin@oceanfriendly.com', 'admin123', 1)";
                
                using var insertCmd = new MySqlCommand(insertAdmin, (MySqlConnection)connection);
                insertCmd.ExecuteNonQuery();
            }
        }

        private void InsertDefaultWeights(IDbConnection connection)
        {
            var checkWeights = "SELECT COUNT(*) FROM OceanScoreWeights";
            using var checkCmd = new MySqlCommand(checkWeights, (MySqlConnection)connection);
            var weightsCount = Convert.ToInt32(checkCmd.ExecuteScalar());

            if (weightsCount == 0)
            {
                var insertWeights = @"
                    INSERT INTO OceanScoreWeights (BiodegradabilityWeight, CoralSafetyWeight, FishSafetyWeight, CoverageWeight)
                    VALUES (0.30, 0.30, 0.25, 0.15)";
                
                using var insertCmd = new MySqlCommand(insertWeights, (MySqlConnection)connection);
                insertCmd.ExecuteNonQuery();
            }
        }

        public IDbConnection GetConnection()
        {
            return new MySqlConnection(_connectionString);
        }
    }
}

