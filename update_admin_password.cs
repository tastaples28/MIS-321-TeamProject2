using MySql.Data.MySqlClient;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        // Parse connection string
        var connectionString = "mysql://q6sb2o0l74t4ypmv:e5kzo4a6zuep7ati@tuy8t6uuvh43khkk.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/h0b34ph472kw9gm8";
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

        // Update admin password
        using var connection = new MySqlConnection(connectionStringBuilder.ToString());
        connection.Open();

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("admin123");
        var updateQuery = "UPDATE Users SET PasswordHash = @passwordHash WHERE Username = 'admin'";

        using var cmd = new MySqlCommand(updateQuery, connection);
        cmd.Parameters.AddWithValue("@passwordHash", hashedPassword);
        var rowsAffected = cmd.ExecuteNonQuery();

        Console.WriteLine($"Updated {rowsAffected} admin user(s) with new password hash");
    }
}