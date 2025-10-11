using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using OceanFriendlyProductFinder.Models;
using OceanFriendlyProductFinder.Services;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientsController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public IngredientsController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Ingredient>>> GetIngredients()
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT Id, Name, IsReefSafe, BiodegradabilityScore, CoralSafetyScore, 
                       FishSafetyScore, CoverageScore, Description, CreatedAt
                FROM Ingredients
                ORDER BY Name";

            using var cmd = new SqliteCommand(query, connection);
            var ingredients = new List<Ingredient>();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                ingredients.Add(new Ingredient
                {
                    Id = reader.GetInt32("Id"),
                    Name = reader.GetString("Name"),
                    IsReefSafe = reader.GetBoolean("IsReefSafe"),
                    BiodegradabilityScore = reader.GetInt32("BiodegradabilityScore"),
                    CoralSafetyScore = reader.GetInt32("CoralSafetyScore"),
                    FishSafetyScore = reader.GetInt32("FishSafetyScore"),
                    CoverageScore = reader.GetInt32("CoverageScore"),
                    Description = reader.IsDBNull("Description") ? null : reader.GetString("Description"),
                    CreatedAt = reader.GetDateTime("CreatedAt")
                });
            }

            return Ok(ingredients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ingredient>> GetIngredient(int id)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT Id, Name, IsReefSafe, BiodegradabilityScore, CoralSafetyScore, 
                       FishSafetyScore, CoverageScore, Description, CreatedAt
                FROM Ingredients
                WHERE Id = @id";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return NotFound();
            }

            var ingredient = new Ingredient
            {
                Id = reader.GetInt32("Id"),
                Name = reader.GetString("Name"),
                IsReefSafe = reader.GetBoolean("IsReefSafe"),
                BiodegradabilityScore = reader.GetInt32("BiodegradabilityScore"),
                CoralSafetyScore = reader.GetInt32("CoralSafetyScore"),
                FishSafetyScore = reader.GetInt32("FishSafetyScore"),
                CoverageScore = reader.GetInt32("CoverageScore"),
                Description = reader.IsDBNull("Description") ? null : reader.GetString("Description"),
                CreatedAt = reader.GetDateTime("CreatedAt")
            };

            return Ok(ingredient);
        }

        [HttpPost]
        public async Task<ActionResult<Ingredient>> CreateIngredient([FromBody] IngredientCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                INSERT INTO Ingredients (Name, IsReefSafe, BiodegradabilityScore, CoralSafetyScore, 
                                       FishSafetyScore, CoverageScore, Description)
                VALUES (@name, @isReefSafe, @bioScore, @coralScore, @fishScore, @coverageScore, @description)
                RETURNING Id";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@name", request.Name);
            cmd.Parameters.AddWithValue("@isReefSafe", request.IsReefSafe);
            cmd.Parameters.AddWithValue("@bioScore", request.BiodegradabilityScore);
            cmd.Parameters.AddWithValue("@coralScore", request.CoralSafetyScore);
            cmd.Parameters.AddWithValue("@fishScore", request.FishSafetyScore);
            cmd.Parameters.AddWithValue("@coverageScore", request.CoverageScore);
            cmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);

            try
            {
                var ingredientId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                var ingredient = await GetIngredient(ingredientId);
                return CreatedAtAction(nameof(GetIngredient), new { id = ingredientId }, ingredient.Value);
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19) // UNIQUE constraint failed
            {
                return Conflict("Ingredient with this name already exists");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Ingredient>> UpdateIngredient(int id, [FromBody] IngredientCreateRequest request)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = @"
                UPDATE Ingredients 
                SET Name = @name, IsReefSafe = @isReefSafe, BiodegradabilityScore = @bioScore,
                    CoralSafetyScore = @coralScore, FishSafetyScore = @fishScore, 
                    CoverageScore = @coverageScore, Description = @description
                WHERE Id = @id";

            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@name", request.Name);
            cmd.Parameters.AddWithValue("@isReefSafe", request.IsReefSafe);
            cmd.Parameters.AddWithValue("@bioScore", request.BiodegradabilityScore);
            cmd.Parameters.AddWithValue("@coralScore", request.CoralSafetyScore);
            cmd.Parameters.AddWithValue("@fishScore", request.FishSafetyScore);
            cmd.Parameters.AddWithValue("@coverageScore", request.CoverageScore);
            cmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);

            try
            {
                var rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected == 0)
                {
                    return NotFound();
                }

                var ingredient = await GetIngredient(id);
                return Ok(ingredient.Value);
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19) // UNIQUE constraint failed
            {
                return Conflict("Ingredient with this name already exists");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteIngredient(int id)
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            var query = "DELETE FROM Ingredients WHERE Id = @id";
            using var cmd = new SqliteCommand(query, connection);
            cmd.Parameters.AddWithValue("@id", id);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            if (rowsAffected == 0)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}

