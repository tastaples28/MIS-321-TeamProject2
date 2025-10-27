using MySql.Data.MySqlClient;
using OceanFriendlyProductFinder.Models;
using System.Data;

namespace OceanFriendlyProductFinder.Services
{
    public class OceanScoreService
    {
        private readonly DatabaseService _databaseService;
        private readonly IConfiguration _configuration;

        public OceanScoreService(DatabaseService databaseService, IConfiguration configuration)
        {
            _databaseService = databaseService;
            _configuration = configuration;
        }

        /// <summary>
        /// Calculates Ocean Score for a product based on its ingredients and configurable weights
        /// Uses a weighted algorithm: Biodegradability + Coral Safety + Fish Safety + Coverage
        /// </summary>
        public async Task<OceanScoreBreakdown> CalculateOceanScoreAsync(int productId)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            // Get current weights from database
            var weights = await GetCurrentWeightsAsync(connection);

            // Get product ingredients with their scores
            var ingredientsQuery = @"
                SELECT i.Id, i.Name, i.IsReefSafe, i.BiodegradabilityScore, 
                       i.CoralSafetyScore, i.FishSafetyScore, i.CoverageScore
                FROM Ingredients i
                INNER JOIN ProductIngredients pi ON i.Id = pi.IngredientId
                WHERE pi.ProductId = @productId";

            using var cmd = new MySqlCommand(ingredientsQuery, (MySqlConnection)connection);
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
                    CoverageScore = reader.GetInt32(reader.GetOrdinal("CoverageScore"))
                });
            }

            if (!ingredients.Any())
            {
                return new OceanScoreBreakdown
                {
                    TotalScore = 0,
                    SafetyLevel = "Unknown"
                };
            }

            // Calculate weighted scores
            var biodegradabilityScore = CalculateWeightedScore(ingredients, i => i.BiodegradabilityScore, weights.BiodegradabilityWeight);
            var coralSafetyScore = CalculateWeightedScore(ingredients, i => i.CoralSafetyScore, weights.CoralSafetyWeight);
            var fishSafetyScore = CalculateWeightedScore(ingredients, i => i.FishSafetyScore, weights.FishSafetyWeight);
            var coverageScore = CalculateWeightedScore(ingredients, i => i.CoverageScore, weights.CoverageWeight);

            // Calculate total Ocean Score (1-100)
            var totalScore = Math.Max(1, Math.Min(100, 
                (int)Math.Round(biodegradabilityScore + coralSafetyScore + fishSafetyScore + coverageScore)));

            // Determine safety level
            var safetyLevel = DetermineSafetyLevel(totalScore);

            // Categorize ingredients
            var harmfulIngredients = ingredients.Where(i => !i.IsReefSafe).Select(i => i.Name).ToList();
            var safeIngredients = ingredients.Where(i => i.IsReefSafe).Select(i => i.Name).ToList();

            return new OceanScoreBreakdown
            {
                TotalScore = totalScore,
                BiodegradabilityScore = (int)Math.Round(biodegradabilityScore),
                CoralSafetyScore = (int)Math.Round(coralSafetyScore),
                FishSafetyScore = (int)Math.Round(fishSafetyScore),
                CoverageScore = (int)Math.Round(coverageScore),
                HarmfulIngredients = harmfulIngredients,
                SafeIngredients = safeIngredients,
                SafetyLevel = safetyLevel
            };
        }

        /// <summary>
        /// Updates Ocean Score weights in the database
        /// </summary>
        public async Task UpdateWeightsAsync(OceanScoreWeightsUpdateRequest request)
        {
            // Validate weights sum to 1.0
            var totalWeight = request.BiodegradabilityWeight + request.CoralSafetyWeight + 
                            request.FishSafetyWeight + request.CoverageWeight;
            
            if (Math.Abs(totalWeight - 1.0) > 0.01)
            {
                throw new ArgumentException("Weights must sum to 1.0");
            }

            using var connection = _databaseService.GetConnection();
            connection.Open();

            var updateQuery = @"
                UPDATE OceanScoreWeights 
                SET BiodegradabilityWeight = @bioWeight,
                    CoralSafetyWeight = @coralWeight,
                    FishSafetyWeight = @fishWeight,
                    CoverageWeight = @coverageWeight,
                    UpdatedAt = CURRENT_TIMESTAMP
                WHERE Id = 1";

            using var cmd = new MySqlCommand(updateQuery, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@bioWeight", request.BiodegradabilityWeight);
            cmd.Parameters.AddWithValue("@coralWeight", request.CoralSafetyWeight);
            cmd.Parameters.AddWithValue("@fishWeight", request.FishSafetyWeight);
            cmd.Parameters.AddWithValue("@coverageWeight", request.CoverageWeight);

            await cmd.ExecuteNonQueryAsync();

            // Recalculate all product scores
            await RecalculateAllProductScoresAsync(connection);
        }

        /// <summary>
        /// Gets current Ocean Score weights from database
        /// </summary>
        public async Task<OceanScoreWeights> GetCurrentWeightsAsync()
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();
            return await GetCurrentWeightsAsync(connection);
        }

        private async Task<OceanScoreWeights> GetCurrentWeightsAsync(IDbConnection connection)
        {
            var query = "SELECT * FROM OceanScoreWeights WHERE Id = 1";
            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new OceanScoreWeights
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    BiodegradabilityWeight = reader.GetDouble(reader.GetOrdinal("BiodegradabilityWeight")),
                    CoralSafetyWeight = reader.GetDouble(reader.GetOrdinal("CoralSafetyWeight")),
                    FishSafetyWeight = reader.GetDouble(reader.GetOrdinal("FishSafetyWeight")),
                    CoverageWeight = reader.GetDouble(reader.GetOrdinal("CoverageWeight")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                };
            }

            // Return default weights if none found
            return new OceanScoreWeights
            {
                BiodegradabilityWeight = 0.3,
                CoralSafetyWeight = 0.3,
                FishSafetyWeight = 0.25,
                CoverageWeight = 0.15
            };
        }

        private double CalculateWeightedScore(List<Ingredient> ingredients, Func<Ingredient, int> scoreSelector, double weight)
        {
            if (!ingredients.Any()) return 0;

            // Calculate average score for this category
            var averageScore = ingredients.Average(scoreSelector);
            
            // Apply weight and ensure it's within 0-100 range
            return Math.Max(0, Math.Min(100, averageScore * weight));
        }

        private string DetermineSafetyLevel(int score)
        {
            return score switch
            {
                >= 80 => "Safe",
                >= 50 => "Moderate",
                _ => "Harmful"
            };
        }

        private async Task RecalculateAllProductScoresAsync(IDbConnection connection)
        {
            // Get current weights from database
            var weights = await GetCurrentWeightsAsync(connection);

            // Get all product IDs (close reader before reusing connection)
            var productQuery = "SELECT Id FROM Products";
            using var productCmd = new MySqlCommand(productQuery, (MySqlConnection)connection);
            using var productReader = await productCmd.ExecuteReaderAsync();

            var productIds = new List<int>();
            while (await productReader.ReadAsync())
            {
                productIds.Add(productReader.GetInt32("Id"));
            }

            // Recalculate scores for each product - must close previous reader before executing new commands
            using (var tempConnection = _databaseService.GetConnection())
            {
                tempConnection.Open();
                
                foreach (var productId in productIds)
                {
                    // Get product ingredients with their scores using a separate connection
                    var ingredientsQuery = @"
                        SELECT i.Id, i.Name, i.IsReefSafe, i.BiodegradabilityScore, 
                               i.CoralSafetyScore, i.FishSafetyScore, i.CoverageScore
                        FROM Ingredients i
                        INNER JOIN ProductIngredients pi ON i.Id = pi.IngredientId
                        WHERE pi.ProductId = @productId";

                    using var ingredientsCmd = new MySqlCommand(ingredientsQuery, (MySqlConnection)tempConnection);
                    ingredientsCmd.Parameters.AddWithValue("@productId", productId);

                    var ingredients = new List<Ingredient>();
                    using (var ingredientsReader = await ingredientsCmd.ExecuteReaderAsync())
                    {
                        while (await ingredientsReader.ReadAsync())
                        {
                            ingredients.Add(new Ingredient
                            {
                                Id = ingredientsReader.GetInt32(ingredientsReader.GetOrdinal("Id")),
                                Name = ingredientsReader.GetString(ingredientsReader.GetOrdinal("Name")),
                                IsReefSafe = ingredientsReader.GetBoolean(ingredientsReader.GetOrdinal("IsReefSafe")),
                                BiodegradabilityScore = ingredientsReader.GetInt32(ingredientsReader.GetOrdinal("BiodegradabilityScore")),
                                CoralSafetyScore = ingredientsReader.GetInt32(ingredientsReader.GetOrdinal("CoralSafetyScore")),
                                FishSafetyScore = ingredientsReader.GetInt32(ingredientsReader.GetOrdinal("FishSafetyScore")),
                                CoverageScore = ingredientsReader.GetInt32(ingredientsReader.GetOrdinal("CoverageScore"))
                            });
                        }
                    } // Reader is now fully closed before proceeding

                    if (!ingredients.Any())
                    {
                        continue;
                    }

                    // Calculate weighted scores
                    var biodegradabilityScore = CalculateWeightedScore(ingredients, i => i.BiodegradabilityScore, weights.BiodegradabilityWeight);
                    var coralSafetyScore = CalculateWeightedScore(ingredients, i => i.CoralSafetyScore, weights.CoralSafetyWeight);
                    var fishSafetyScore = CalculateWeightedScore(ingredients, i => i.FishSafetyScore, weights.FishSafetyWeight);
                    var coverageScore = CalculateWeightedScore(ingredients, i => i.CoverageScore, weights.CoverageWeight);

                    // Calculate total Ocean Score (1-100)
                    var totalScore = Math.Max(1, Math.Min(100, 
                        (int)Math.Round(biodegradabilityScore + coralSafetyScore + fishSafetyScore + coverageScore)));
                
                var updateQuery = @"
                    UPDATE Products 
                    SET OceanScore = @oceanScore,
                        BiodegradabilityScore = @bioScore,
                        CoralSafetyScore = @coralScore,
                        FishSafetyScore = @fishScore,
                        CoverageScore = @coverageScore,
                        UpdatedAt = CURRENT_TIMESTAMP
                    WHERE Id = @productId";

                    using var updateCmd = new MySqlCommand(updateQuery, (MySqlConnection)tempConnection);
                    updateCmd.Parameters.AddWithValue("@oceanScore", totalScore);
                    updateCmd.Parameters.AddWithValue("@bioScore", (int)Math.Round(biodegradabilityScore));
                    updateCmd.Parameters.AddWithValue("@coralScore", (int)Math.Round(coralSafetyScore));
                    updateCmd.Parameters.AddWithValue("@fishScore", (int)Math.Round(fishSafetyScore));
                    updateCmd.Parameters.AddWithValue("@coverageScore", (int)Math.Round(coverageScore));
                updateCmd.Parameters.AddWithValue("@productId", productId);

                await updateCmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}

