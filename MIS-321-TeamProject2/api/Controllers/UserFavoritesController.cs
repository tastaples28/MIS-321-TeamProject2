using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using OceanFriendlyProductFinder.Models;
using OceanFriendlyProductFinder.Services;
using System.Data;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserFavoritesController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public UserFavoritesController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<List<Product>>> GetUserFavorites(int userId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = @"
                SELECT p.Id, p.Name, p.Brand, p.Category, p.Description, p.ImageUrl, p.ExternalLink,
                       p.OceanScore, p.BiodegradabilityScore, p.CoralSafetyScore, p.FishSafetyScore, p.CoverageScore,
                       p.CreatedAt, p.UpdatedAt
                FROM Products p
                INNER JOIN UserFavorites uf ON p.Id = uf.ProductId
                WHERE uf.UserId = @userId
                ORDER BY p.Name";

            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@userId", userId);

            var products = new List<Product>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var product = new Product
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    Brand = reader.GetString(reader.GetOrdinal("Brand")),
                    Category = reader.GetString(reader.GetOrdinal("Category")),
                    Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                    ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl")) ? null : reader.GetString(reader.GetOrdinal("ImageUrl")),
                    ExternalLink = reader.IsDBNull(reader.GetOrdinal("ExternalLink")) ? null : reader.GetString(reader.GetOrdinal("ExternalLink")),
                    OceanScore = reader.GetInt32(reader.GetOrdinal("OceanScore")),
                    BiodegradabilityScore = reader.GetInt32(reader.GetOrdinal("BiodegradabilityScore")),
                    CoralSafetyScore = reader.GetInt32(reader.GetOrdinal("CoralSafetyScore")),
                    FishSafetyScore = reader.GetInt32(reader.GetOrdinal("FishSafetyScore")),
                    CoverageScore = reader.GetInt32(reader.GetOrdinal("CoverageScore")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                };

                // Get ingredients for this product
                product.Ingredients = await GetProductIngredientsAsync(product.Id);
                products.Add(product);
            }

            return Ok(products);
        }

        [HttpPost("{userId}/favorites/{productId}")]
        public async Task<ActionResult> AddToFavorites(int userId, int productId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            try
            {
                // Check if user exists
                var userExistsQuery = "SELECT COUNT(*) FROM Users WHERE Id = @userId";
                using var userExistsCmd = new MySqlCommand(userExistsQuery, (MySqlConnection)connection);
                userExistsCmd.Parameters.AddWithValue("@userId", userId);
                var userExists = Convert.ToInt32(await userExistsCmd.ExecuteScalarAsync()) > 0;

                if (!userExists)
                {
                    return NotFound("User not found");
                }

                // Check if product exists
                var productExistsQuery = "SELECT COUNT(*) FROM Products WHERE Id = @productId";
                using var productExistsCmd = new MySqlCommand(productExistsQuery, (MySqlConnection)connection);
                productExistsCmd.Parameters.AddWithValue("@productId", productId);
                var productExists = Convert.ToInt32(await productExistsCmd.ExecuteScalarAsync()) > 0;

                if (!productExists)
                {
                    return NotFound("Product not found");
                }

                // Check if already in favorites
                var checkQuery = "SELECT COUNT(*) FROM UserFavorites WHERE UserId = @userId AND ProductId = @productId";
                using var checkCmd = new MySqlCommand(checkQuery, (MySqlConnection)connection);
                checkCmd.Parameters.AddWithValue("@userId", userId);
                checkCmd.Parameters.AddWithValue("@productId", productId);
                var alreadyExists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;

                if (alreadyExists)
                {
                    return Conflict("Product is already in favorites");
                }

                // Add to favorites
                var insertQuery = "INSERT INTO UserFavorites (UserId, ProductId) VALUES (@userId, @productId)";
                using var insertCmd = new MySqlCommand(insertQuery, (MySqlConnection)connection);
                insertCmd.Parameters.AddWithValue("@userId", userId);
                insertCmd.Parameters.AddWithValue("@productId", productId);

                await insertCmd.ExecuteNonQueryAsync();

                return Ok(new { message = "Product added to favorites successfully" });
            }
            catch (MySqlException ex) when (ex.Number == 1062) // Duplicate entry
            {
                return Conflict("Product is already in favorites");
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to add to favorites: {ex.Message}");
            }
        }

        [HttpDelete("{userId}/favorites/{productId}")]
        public async Task<ActionResult> RemoveFromFavorites(int userId, int productId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = "DELETE FROM UserFavorites WHERE UserId = @userId AND ProductId = @productId";
            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@productId", productId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
            {
                return NotFound("Favorite not found");
            }

            return Ok(new { message = "Product removed from favorites successfully" });
        }

        [HttpGet("{userId}/favorites/{productId}/status")]
        public async Task<ActionResult<FavoriteStatusResponse>> GetFavoriteStatus(int userId, int productId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = "SELECT COUNT(*) FROM UserFavorites WHERE UserId = @userId AND ProductId = @productId";
            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@productId", productId);

            var isFavorite = Convert.ToInt32(await cmd.ExecuteScalarAsync()) > 0;

            return Ok(new FavoriteStatusResponse
            {
                IsFavorite = isFavorite,
                UserId = userId,
                ProductId = productId
            });
        }

        [HttpGet("{userId}/favorites/count")]
        public async Task<ActionResult<FavoriteCountResponse>> GetFavoriteCount(int userId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = "SELECT COUNT(*) FROM UserFavorites WHERE UserId = @userId";
            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@userId", userId);

            var count = Convert.ToInt32(await cmd.ExecuteScalarAsync());

            return Ok(new FavoriteCountResponse
            {
                UserId = userId,
                Count = count
            });
        }

        private async Task<List<Ingredient>> GetProductIngredientsAsync(int productId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = @"
                SELECT i.Id, i.Name, i.IsReefSafe, i.BiodegradabilityScore, 
                       i.CoralSafetyScore, i.FishSafetyScore, i.CoverageScore, i.Description, i.CreatedAt
                FROM Ingredients i
                INNER JOIN ProductIngredients pi ON i.Id = pi.IngredientId
                WHERE pi.ProductId = @productId";

            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@productId", productId);

            var ingredients = new List<Ingredient>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                ingredients.Add(new Ingredient
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    IsReefSafe = reader.GetBoolean(reader.GetOrdinal("IsReefSafe")),
                    BiodegradabilityScore = reader.GetInt32(reader.GetOrdinal("BiodegradabilityScore")),
                    CoralSafetyScore = reader.GetInt32(reader.GetOrdinal("CoralSafetyScore")),
                    FishSafetyScore = reader.GetInt32(reader.GetOrdinal("FishSafetyScore")),
                    CoverageScore = reader.GetInt32(reader.GetOrdinal("CoverageScore")),
                    Description = reader.IsDBNull(reader.GetOrdinal("Description")) ? null : reader.GetString(reader.GetOrdinal("Description")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                });
            }

            return ingredients;
        }
    }
}
