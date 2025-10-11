using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using OceanFriendlyProductFinder.Models;
using OceanFriendlyProductFinder.Services;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly DatabaseService _databaseService;
        private readonly OceanScoreService _oceanScoreService;

        public AdminController(DatabaseService databaseService, OceanScoreService oceanScoreService)
        {
            _databaseService = databaseService;
            _oceanScoreService = oceanScoreService;
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT Id, Username, Email, SensitivityPreferences, IsAdmin, CreatedAt
                FROM Users
                ORDER BY CreatedAt DESC";

            using var cmd = new SqliteCommand(query, connection);
            var users = new List<User>();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                users.Add(new User
                {
                    Id = reader.GetInt32("Id"),
                    Username = reader.GetString("Username"),
                    Email = reader.GetString("Email"),
                    SensitivityPreferences = reader.IsDBNull("SensitivityPreferences") ? null : reader.GetString("SensitivityPreferences"),
                    IsAdmin = reader.GetBoolean("IsAdmin"),
                    CreatedAt = reader.GetDateTime("CreatedAt")
                });
            }

            return Ok(users);
        }

        [HttpPost("users")]
        public async Task<ActionResult<User>> CreateUser([FromBody] UserCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                INSERT INTO Users (Username, Email, PasswordHash, SensitivityPreferences, IsAdmin)
                VALUES (@username, @email, @passwordHash, @sensitivityPreferences, @isAdmin)
                RETURNING Id";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@username", request.Username);
            cmd.Parameters.AddWithValue("@email", request.Email);
            cmd.Parameters.AddWithValue("@passwordHash", BCrypt.Net.BCrypt.HashPassword(request.Password));
            cmd.Parameters.AddWithValue("@sensitivityPreferences", request.SensitivityPreferences ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@isAdmin", false);

            try
            {
                var userId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                
                // Return user without password hash
                var getUserQuery = @"
                    SELECT Id, Username, Email, SensitivityPreferences, IsAdmin, CreatedAt
                    FROM Users
                    WHERE Id = @id";

                using var getUserCmd = new SqliteCommand(getUserQuery, connection);
                getUserCmd.Parameters.AddWithValue("@id", userId);

                using var reader = await getUserCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = reader.GetInt32("Id"),
                        Username = reader.GetString("Username"),
                        Email = reader.GetString("Email"),
                        SensitivityPreferences = reader.IsDBNull("SensitivityPreferences") ? null : reader.GetString("SensitivityPreferences"),
                        IsAdmin = reader.GetBoolean("IsAdmin"),
                        CreatedAt = reader.GetDateTime("CreatedAt")
                    };

                    return CreatedAtAction(nameof(GetUsers), new { id = userId }, user);
                }

                return BadRequest("Failed to retrieve created user");
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19) // UNIQUE constraint failed
            {
                return Conflict("Username or email already exists");
            }
        }

        [HttpPut("users/{id}")]
        public async Task<ActionResult<User>> UpdateUser(int id, [FromBody] UserCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                UPDATE Users 
                SET Username = @username, Email = @email, SensitivityPreferences = @sensitivityPreferences
                WHERE Id = @id";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@username", request.Username);
            cmd.Parameters.AddWithValue("@email", request.Email);
            cmd.Parameters.AddWithValue("@sensitivityPreferences", request.SensitivityPreferences ?? (object)DBNull.Value);

            try
            {
                var rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    return NotFound();
                }

                // Return updated user
                var getUserQuery = @"
                    SELECT Id, Username, Email, SensitivityPreferences, IsAdmin, CreatedAt
                    FROM Users
                    WHERE Id = @id";

                using var getUserCmd = new SqliteCommand(getUserQuery, connection);
                getUserCmd.Parameters.AddWithValue("@id", id);

                using var reader = await getUserCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = reader.GetInt32("Id"),
                        Username = reader.GetString("Username"),
                        Email = reader.GetString("Email"),
                        SensitivityPreferences = reader.IsDBNull("SensitivityPreferences") ? null : reader.GetString("SensitivityPreferences"),
                        IsAdmin = reader.GetBoolean("IsAdmin"),
                        CreatedAt = reader.GetDateTime("CreatedAt")
                    };

                    return Ok(user);
                }

                return BadRequest("Failed to retrieve updated user");
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19) // UNIQUE constraint failed
            {
                return Conflict("Username or email already exists");
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = "DELETE FROM Users WHERE Id = @id AND IsAdmin = 0"; // Prevent deleting admin users
            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("ocean-score-weights")]
        public async Task<ActionResult<OceanScoreWeights>> GetOceanScoreWeights()
        {
            var weights = await _oceanScoreService.GetCurrentWeightsAsync();
            return Ok(weights);
        }

        [HttpPut("ocean-score-weights")]
        public async Task<ActionResult<OceanScoreWeights>> UpdateOceanScoreWeights([FromBody] OceanScoreWeightsUpdateRequest request)
        {
            try
            {
                await _oceanScoreService.UpdateWeightsAsync(request);
                var updatedWeights = await _oceanScoreService.GetCurrentWeightsAsync();
                return Ok(updatedWeights);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("recalculate-scores")]
        public async Task<ActionResult> RecalculateAllScores()
        {
            try
            {
                using var connection = _databaseService.GetConnection();
                await connection.OpenAsync();

                // Get all product IDs
                var productQuery = "SELECT Id FROM Products";
                using var productCmd = new SqliteCommand(productQuery, connection);
                using var productReader = await productCmd.ExecuteReaderAsync();

                var productIds = new List<int>();
                while (await productReader.ReadAsync())
                {
                    productIds.Add(productReader.GetInt32("Id"));
                }

                // Recalculate scores for each product
                foreach (var productId in productIds)
                {
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

                    using var updateCmd = new SqliteCommand(updateQuery, connection);
                    updateCmd.Parameters.AddWithValue("@oceanScore", breakdown.TotalScore);
                    updateCmd.Parameters.AddWithValue("@bioScore", breakdown.BiodegradabilityScore);
                    updateCmd.Parameters.AddWithValue("@coralScore", breakdown.CoralSafetyScore);
                    updateCmd.Parameters.AddWithValue("@fishScore", breakdown.FishSafetyScore);
                    updateCmd.Parameters.AddWithValue("@coverageScore", breakdown.CoverageScore);
                    updateCmd.Parameters.AddWithValue("@productId", productId);

                    await updateCmd.ExecuteNonQueryAsync();
                }

                return Ok(new { message = $"Recalculated Ocean Scores for {productIds.Count} products" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error recalculating scores: {ex.Message}");
            }
        }
    }
}

