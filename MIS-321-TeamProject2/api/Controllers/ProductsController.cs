using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using OceanFriendlyProductFinder.Models;
using OceanFriendlyProductFinder.Services;
using System.Data;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly DatabaseService _databaseService;
        private readonly OceanScoreService _oceanScoreService;

        public ProductsController(DatabaseService databaseService, OceanScoreService oceanScoreService)
        {
            _databaseService = databaseService;
            _oceanScoreService = oceanScoreService;
        }

        [HttpGet]
        public async Task<ActionResult<ProductSearchResponse>> GetProducts([FromQuery] ProductSearchRequest request)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var whereClause = "WHERE 1=1";
            var parameters = new List<MySqlParameter>();

            // Build dynamic WHERE clause based on search criteria
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                whereClause += " AND (p.Name LIKE @searchTerm OR p.Brand LIKE @searchTerm OR p.Category LIKE @searchTerm)";
                parameters.Add(new MySqlParameter("@searchTerm", $"%{request.SearchTerm}%"));
            }

            if (!string.IsNullOrEmpty(request.Category))
            {
                whereClause += " AND p.Category = @category";
                parameters.Add(new MySqlParameter("@category", request.Category));
            }

            if (!string.IsNullOrEmpty(request.Brand))
            {
                whereClause += " AND p.Brand = @brand";
                parameters.Add(new MySqlParameter("@brand", request.Brand));
            }

            if (request.MinOceanScore.HasValue)
            {
                whereClause += " AND p.OceanScore >= @minScore";
                parameters.Add(new MySqlParameter("@minScore", request.MinOceanScore.Value));
            }

            if (request.MaxOceanScore.HasValue)
            {
                whereClause += " AND p.OceanScore <= @maxScore";
                parameters.Add(new MySqlParameter("@maxScore", request.MaxOceanScore.Value));
            }

            // Get total count
            var countQuery = $"SELECT COUNT(*) FROM Products p {whereClause}";
            using var countCmd = new MySqlCommand(countQuery, (MySqlConnection)connection);
            countCmd.Parameters.AddRange(parameters.ToArray());
            var totalCount = Convert.ToInt32(await countCmd.ExecuteScalarAsync());

            // Get products with pagination
            var page = request.Page ?? 1;
            var pageSize = request.PageSize ?? 20;
            var offset = (page - 1) * pageSize;

            var productsQuery = $@"
                SELECT p.Id, p.Name, p.Brand, p.Category, p.Description, p.ImageUrl, p.ExternalLink,
                       p.OceanScore, p.BiodegradabilityScore, p.CoralSafetyScore, p.FishSafetyScore, p.CoverageScore,
                       p.CreatedAt, p.UpdatedAt
                FROM Products p
                {whereClause}
                ORDER BY p.OceanScore DESC, p.Name
                LIMIT @pageSize OFFSET @offset";

            using var productsCmd = new MySqlCommand(productsQuery, (MySqlConnection)connection);
            productsCmd.Parameters.AddRange(parameters.ToArray());
            productsCmd.Parameters.Add(new MySqlParameter("@pageSize", pageSize));
            productsCmd.Parameters.Add(new MySqlParameter("@offset", offset));

            var products = new List<Product>();
            using var reader = await productsCmd.ExecuteReaderAsync();
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

                // Load ingredients for this product
                product.Ingredients = await GetProductIngredientsAsync(product.Id);
                products.Add(product);
            }

            return Ok(new ProductSearchResponse
            {
                Products = products,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = @"
                SELECT Id, Name, Brand, Category, Description, ImageUrl, ExternalLink,
                       OceanScore, BiodegradabilityScore, CoralSafetyScore, FishSafetyScore, CoverageScore,
                       CreatedAt, UpdatedAt
                FROM Products
                WHERE Id = @id";

            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return NotFound();
            }

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

            product.Ingredients = await GetProductIngredientsAsync(product.Id);

            return Ok(product);
        }

        [HttpGet("{id}/ocean-score")]
        public async Task<ActionResult<OceanScoreBreakdown>> GetOceanScore(int id)
        {
            try
            {
                var breakdown = await _oceanScoreService.CalculateOceanScoreAsync(id);
                return Ok(breakdown);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error calculating Ocean Score: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                 // Insert product
                 var insertQuery = @"
                     INSERT INTO Products (Name, Brand, Category, Description, ImageUrl, ExternalLink, 
                                         OceanScore, BiodegradabilityScore, CoralSafetyScore, FishSafetyScore, CoverageScore)
                     VALUES (@name, @brand, @category, @description, @imageUrl, @externalLink, 0, 0, 0, 0, 0) RETURNING Id";

                using var cmd = new MySqlCommand(insertQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                cmd.Parameters.AddWithValue("@name", request.Name);
                cmd.Parameters.AddWithValue("@brand", request.Brand);
                cmd.Parameters.AddWithValue("@category", request.Category);
                cmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@imageUrl", request.ImageUrl ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@externalLink", request.ExternalLink ?? (object)DBNull.Value);

                 var productId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                // Link ingredients
                foreach (var ingredientId in request.IngredientIds)
                {
                    var linkQuery = "INSERT INTO ProductIngredients (ProductId, IngredientId) VALUES (@productId, @ingredientId) RETURNING Id";
                    using var linkCmd = new MySqlCommand(linkQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                    linkCmd.Parameters.AddWithValue("@productId", productId);
                    linkCmd.Parameters.AddWithValue("@ingredientId", ingredientId);
                    await linkCmd.ExecuteNonQueryAsync();
                }

                // Calculate Ocean Score
                var breakdown = await _oceanScoreService.CalculateOceanScoreAsync(productId);
                
                var updateQuery = @"
                    UPDATE Products 
                    SET OceanScore = @oceanScore,
                        BiodegradabilityScore = @bioScore,
                        CoralSafetyScore = @coralScore,
                        FishSafetyScore = @fishScore,
                        CoverageScore = @coverageScore,
                        UpdatedAt = CURRENT_TIMESTAMP
                    WHERE Id = @productId";

                using var updateCmd = new MySqlCommand(updateQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                updateCmd.Parameters.AddWithValue("@oceanScore", breakdown.TotalScore);
                updateCmd.Parameters.AddWithValue("@bioScore", breakdown.BiodegradabilityScore);
                updateCmd.Parameters.AddWithValue("@coralScore", breakdown.CoralSafetyScore);
                updateCmd.Parameters.AddWithValue("@fishScore", breakdown.FishSafetyScore);
                updateCmd.Parameters.AddWithValue("@coverageScore", breakdown.CoverageScore);
                updateCmd.Parameters.AddWithValue("@productId", productId);

                await updateCmd.ExecuteNonQueryAsync();

                transaction.Commit();

                var product = await GetProduct(productId);
                return CreatedAtAction(nameof(GetProduct), new { id = productId }, product.Value);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest($"Error creating product: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] ProductCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Update product
                var updateQuery = @"
                    UPDATE Products 
                    SET Name = @name, Brand = @brand, Category = @category, 
                        Description = @description, ImageUrl = @imageUrl, ExternalLink = @externalLink,
                        UpdatedAt = CURRENT_TIMESTAMP
                    WHERE Id = @id";

                using var cmd = new MySqlCommand(updateQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@name", request.Name);
                cmd.Parameters.AddWithValue("@brand", request.Brand);
                cmd.Parameters.AddWithValue("@category", request.Category);
                cmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@imageUrl", request.ImageUrl ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@externalLink", request.ExternalLink ?? (object)DBNull.Value);

                var rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    transaction.Rollback();
                    return NotFound();
                }

                // Update ingredient links
                var deleteLinksQuery = "DELETE FROM ProductIngredients WHERE ProductId = @productId";
                using var deleteCmd = new MySqlCommand(deleteLinksQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                deleteCmd.Parameters.AddWithValue("@productId", id);
                await deleteCmd.ExecuteNonQueryAsync();

                foreach (var ingredientId in request.IngredientIds)
                {
                    var linkQuery = "INSERT INTO ProductIngredients (ProductId, IngredientId) VALUES (@productId, @ingredientId) RETURNING Id";
                    using var linkCmd = new MySqlCommand(linkQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                    linkCmd.Parameters.AddWithValue("@productId", id);
                    linkCmd.Parameters.AddWithValue("@ingredientId", ingredientId);
                    await linkCmd.ExecuteNonQueryAsync();
                }

                // Recalculate Ocean Score
                var breakdown = await _oceanScoreService.CalculateOceanScoreAsync(id);
                
                var scoreUpdateQuery = @"
                    UPDATE Products 
                    SET OceanScore = @oceanScore,
                        BiodegradabilityScore = @bioScore,
                        CoralSafetyScore = @coralScore,
                        FishSafetyScore = @fishScore,
                        CoverageScore = @coverageScore,
                        UpdatedAt = CURRENT_TIMESTAMP
                    WHERE Id = @productId";

                using var scoreUpdateCmd = new MySqlCommand(scoreUpdateQuery, (MySqlConnection)connection, (MySqlTransaction)transaction);
                scoreUpdateCmd.Parameters.AddWithValue("@oceanScore", breakdown.TotalScore);
                scoreUpdateCmd.Parameters.AddWithValue("@bioScore", breakdown.BiodegradabilityScore);
                scoreUpdateCmd.Parameters.AddWithValue("@coralScore", breakdown.CoralSafetyScore);
                scoreUpdateCmd.Parameters.AddWithValue("@fishScore", breakdown.FishSafetyScore);
                scoreUpdateCmd.Parameters.AddWithValue("@coverageScore", breakdown.CoverageScore);
                scoreUpdateCmd.Parameters.AddWithValue("@productId", id);

                await scoreUpdateCmd.ExecuteNonQueryAsync();

                transaction.Commit();

                var product = await GetProduct(id);
                return Ok(product.Value);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest($"Error updating product: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = "DELETE FROM Products WHERE Id = @id";
            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@id", id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
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

