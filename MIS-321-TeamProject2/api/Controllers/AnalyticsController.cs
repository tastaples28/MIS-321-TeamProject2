using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using OceanFriendlyProductFinder.Models;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public AnalyticsController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<AnalyticsSummary>> GetAnalyticsSummary()
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            // Get total counts
            var totalSearches = await GetTotalCountAsync(connection, "Action = 'search'");
            var totalViews = await GetTotalCountAsync(connection, "Action = 'view'");
            var totalFavorites = await GetTotalCountAsync(connection, "Action = 'favorite'");

            // Get top products by views and favorites
            var topProducts = await GetTopProductsAsync(connection);

            // Get top ingredients by usage
            var topIngredients = await GetTopIngredientsAsync(connection);

            // Get category statistics
            var categoryStats = await GetCategoryStatsAsync(connection);

            // Get average Ocean Score
            var averageOceanScore = await GetAverageOceanScoreAsync(connection);

            return Ok(new AnalyticsSummary
            {
                TotalSearches = totalSearches,
                TotalProductViews = totalViews,
                TotalFavorites = totalFavorites,
                TopProducts = topProducts,
                TopIngredients = topIngredients,
                CategoryStats = categoryStats,
                AverageOceanScore = averageOceanScore
            });
        }

        [HttpPost("log")]
        public async Task<ActionResult> LogAction([FromBody] AnalyticsLog log)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                INSERT INTO AnalyticsLog (UserId, ProductId, Action)
                VALUES (@userId, @productId, @action)";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@userId", log.UserId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@productId", log.ProductId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@action", log.Action);

            await cmd.ExecuteNonQueryAsync();

            return Ok();
        }

        [HttpGet("export/csv")]
        public async Task<ActionResult> ExportAnalyticsCsv()
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT al.Id, al.UserId, al.ProductId, al.Action, al.Timestamp,
                       u.Username, p.Name as ProductName, p.Brand, p.Category, p.OceanScore
                FROM AnalyticsLog al
                LEFT JOIN Users u ON al.UserId = u.Id
                LEFT JOIN Products p ON al.ProductId = p.Id
                ORDER BY al.Timestamp DESC";

            using var cmd = new SqliteCommand(query, connection);
            using var reader = await cmd.ExecuteReaderAsync();

            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Id,UserId,Username,ProductId,ProductName,Brand,Category,OceanScore,Action,Timestamp");

            while (await reader.ReadAsync())
            {
                var id = reader.GetInt32("Id");
                var userId = reader.IsDBNull("UserId") ? "" : reader.GetInt32("UserId").ToString();
                var username = reader.IsDBNull("Username") ? "" : reader.GetString("Username");
                var productId = reader.IsDBNull("ProductId") ? "" : reader.GetInt32("ProductId").ToString();
                var productName = reader.IsDBNull("ProductName") ? "" : reader.GetString("ProductName");
                var brand = reader.IsDBNull("Brand") ? "" : reader.GetString("Brand");
                var category = reader.IsDBNull("Category") ? "" : reader.GetString("Category");
                var oceanScore = reader.IsDBNull("OceanScore") ? "" : reader.GetInt32("OceanScore").ToString();
                var action = reader.GetString("Action");
                var timestamp = reader.GetDateTime("Timestamp").ToString("yyyy-MM-dd HH:mm:ss");

                csv.AppendLine($"{id},{userId},{username},{productId},{productName},{brand},{category},{oceanScore},{action},{timestamp}");
            }

            var csvBytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
            return File(csvBytes, "text/csv", $"analytics_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }

        private async Task<int> GetTotalCountAsync(SqliteConnection connection, string whereClause)
        {
            var query = $"SELECT COUNT(*) FROM AnalyticsLog WHERE {whereClause}";
            using var cmd = new SqliteCommand(query, connection);
            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }

        private async Task<List<ProductAnalytics>> GetTopProductsAsync(SqliteConnection connection)
        {
            var query = @"
                SELECT p.Id, p.Name, p.Brand, p.OceanScore,
                       COUNT(CASE WHEN al.Action = 'view' THEN 1 END) as ViewCount,
                       COUNT(CASE WHEN al.Action = 'favorite' THEN 1 END) as FavoriteCount
                FROM Products p
                LEFT JOIN AnalyticsLog al ON p.Id = al.ProductId
                GROUP BY p.Id, p.Name, p.Brand, p.OceanScore
                ORDER BY ViewCount DESC, FavoriteCount DESC
                LIMIT 10";

            using var cmd = new SqliteCommand(query, connection);
            var products = new List<ProductAnalytics>();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                products.Add(new ProductAnalytics
                {
                    ProductId = reader.GetInt32("Id"),
                    ProductName = reader.GetString("Name"),
                    Brand = reader.GetString("Brand"),
                    OceanScore = reader.GetInt32("OceanScore"),
                    ViewCount = reader.GetInt32("ViewCount"),
                    FavoriteCount = reader.GetInt32("FavoriteCount")
                });
            }

            return products;
        }

        private async Task<List<IngredientAnalytics>> GetTopIngredientsAsync(SqliteConnection connection)
        {
            var query = @"
                SELECT i.Id, i.Name, i.IsReefSafe, COUNT(pi.ProductId) as UsageCount
                FROM Ingredients i
                LEFT JOIN ProductIngredients pi ON i.Id = pi.IngredientId
                GROUP BY i.Id, i.Name, i.IsReefSafe
                ORDER BY UsageCount DESC
                LIMIT 10";

            using var cmd = new SqliteCommand(query, connection);
            var ingredients = new List<IngredientAnalytics>();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                ingredients.Add(new IngredientAnalytics
                {
                    IngredientId = reader.GetInt32("Id"),
                    IngredientName = reader.GetString("Name"),
                    IsReefSafe = reader.GetBoolean("IsReefSafe"),
                    UsageCount = reader.GetInt32("UsageCount")
                });
            }

            return ingredients;
        }

        private async Task<List<CategoryAnalytics>> GetCategoryStatsAsync(SqliteConnection connection)
        {
            var query = @"
                SELECT Category, COUNT(*) as ProductCount, AVG(OceanScore) as AverageOceanScore
                FROM Products
                GROUP BY Category
                ORDER BY ProductCount DESC";

            using var cmd = new SqliteCommand(query, connection);
            var categories = new List<CategoryAnalytics>();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                categories.Add(new CategoryAnalytics
                {
                    Category = reader.GetString("Category"),
                    ProductCount = reader.GetInt32("ProductCount"),
                    AverageOceanScore = Math.Round(reader.GetDouble("AverageOceanScore"), 2)
                });
            }

            return categories;
        }

        private async Task<double> GetAverageOceanScoreAsync(SqliteConnection connection)
        {
            var query = "SELECT AVG(OceanScore) FROM Products";
            using var cmd = new SqliteCommand(query, connection);
            var result = await cmd.ExecuteScalarAsync();
            return result == DBNull.Value ? 0 : Math.Round(Convert.ToDouble(result), 2);
        }
    }
}

