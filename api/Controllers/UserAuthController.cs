using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using OceanFriendlyProductFinder.Models;
using OceanFriendlyProductFinder.Services;
using System.Data;
using BCrypt.Net;

namespace OceanFriendlyProductFinder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAuthController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public UserAuthController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserRegistrationResponse>> Register([FromBody] UserRegistrationRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new UserRegistrationResponse
                {
                    Success = false,
                    Message = "Username, email, and password are required",
                    User = null
                });
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new UserRegistrationResponse
                {
                    Success = false,
                    Message = "Password must be at least 6 characters long",
                    User = null
                });
            }

            using var connection = _databaseService.GetConnection();
            connection.Open();

            try
            {
                // Check if username or email already exists
                var checkQuery = "SELECT COUNT(*) FROM Users WHERE Username = @username OR Email = @email";
                using var checkCmd = new MySqlCommand(checkQuery, (MySqlConnection)connection);
                checkCmd.Parameters.AddWithValue("@username", request.Username);
                checkCmd.Parameters.AddWithValue("@email", request.Email);

                var existingCount = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                if (existingCount > 0)
                {
                    return Conflict(new UserRegistrationResponse
                    {
                        Success = false,
                        Message = "Username or email already exists",
                        User = null
                    });
                }

                // Create new user
                var insertQuery = @"
                    INSERT INTO Users (Username, Email, PasswordHash, SensitivityPreferences, IsAdmin)
                    VALUES (@username, @email, @passwordHash, @sensitivityPreferences, @isAdmin)";

                using var insertCmd = new MySqlCommand(insertQuery, (MySqlConnection)connection);
                insertCmd.Parameters.AddWithValue("@username", request.Username);
                insertCmd.Parameters.AddWithValue("@email", request.Email);
                insertCmd.Parameters.AddWithValue("@passwordHash", BCrypt.Net.BCrypt.HashPassword(request.Password));
                insertCmd.Parameters.AddWithValue("@sensitivityPreferences", request.SensitivityPreferences ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@isAdmin", false);

                await insertCmd.ExecuteNonQueryAsync();
                var userId = Convert.ToInt32(insertCmd.LastInsertedId);

                // Return user info (without password hash)
                var getUserQuery = @"
                    SELECT Id, Username, Email, SensitivityPreferences, IsAdmin, CreatedAt
                    FROM Users
                    WHERE Id = @id";

                using var getUserCmd = new MySqlCommand(getUserQuery, (MySqlConnection)connection);
                getUserCmd.Parameters.AddWithValue("@id", userId);

                using var reader = await getUserCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Username = reader.GetString(reader.GetOrdinal("Username")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        SensitivityPreferences = reader.IsDBNull(reader.GetOrdinal("SensitivityPreferences")) ? null : reader.GetString(reader.GetOrdinal("SensitivityPreferences")),
                        IsAdmin = reader.GetBoolean(reader.GetOrdinal("IsAdmin")),
                        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                    };

                    return Ok(new UserRegistrationResponse
                    {
                        Success = true,
                        Message = "User registered successfully",
                        User = user
                    });
                }

                return BadRequest(new UserRegistrationResponse
                {
                    Success = false,
                    Message = "Failed to retrieve created user",
                    User = null
                });
            }
            catch (MySqlException ex) when (ex.Number == 1062) // UNIQUE constraint failed
            {
                return Conflict(new UserRegistrationResponse
                {
                    Success = false,
                    Message = "Username or email already exists",
                    User = null
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new UserRegistrationResponse
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}",
                    User = null
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserLoginResponse>> Login([FromBody] UserLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new UserLoginResponse
                {
                    Success = false,
                    Message = "Username and password are required",
                    User = null
                });
            }

            using var connection = _databaseService.GetConnection();
            connection.Open();

            try
            {
                var query = @"
                    SELECT Id, Username, Email, PasswordHash, SensitivityPreferences, IsAdmin, CreatedAt
                    FROM Users
                    WHERE Username = @username";

                using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
                cmd.Parameters.AddWithValue("@username", request.Username);

                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var storedPasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
                    
                    if (BCrypt.Net.BCrypt.Verify(request.Password, storedPasswordHash))
                    {
                        var user = new User
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("Id")),
                            Username = reader.GetString(reader.GetOrdinal("Username")),
                            Email = reader.GetString(reader.GetOrdinal("Email")),
                            SensitivityPreferences = reader.IsDBNull(reader.GetOrdinal("SensitivityPreferences")) ? null : reader.GetString(reader.GetOrdinal("SensitivityPreferences")),
                            IsAdmin = reader.GetBoolean(reader.GetOrdinal("IsAdmin")),
                            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                        };

                        return Ok(new UserLoginResponse
                        {
                            Success = true,
                            Message = "Login successful",
                            User = user
                        });
                    }
                }

                return Unauthorized(new UserLoginResponse
                {
                    Success = false,
                    Message = "Invalid username or password",
                    User = null
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new UserLoginResponse
                {
                    Success = false,
                    Message = $"Login failed: {ex.Message}",
                    User = null
                });
            }
        }

        [HttpGet("profile/{id}")]
        public async Task<ActionResult<User>> GetUserProfile(int id)
        {
            using var connection = _databaseService.GetConnection();
            connection.Open();

            var query = @"
                SELECT Id, Username, Email, SensitivityPreferences, IsAdmin, CreatedAt
                FROM Users
                WHERE Id = @id";

            using var cmd = new MySqlCommand(query, (MySqlConnection)connection);
            cmd.Parameters.AddWithValue("@id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var user = new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Username = reader.GetString(reader.GetOrdinal("Username")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    SensitivityPreferences = reader.IsDBNull(reader.GetOrdinal("SensitivityPreferences")) ? null : reader.GetString(reader.GetOrdinal("SensitivityPreferences")),
                    IsAdmin = reader.GetBoolean(reader.GetOrdinal("IsAdmin")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                };

                return Ok(user);
            }

            return NotFound("User not found");
        }
    }
}
