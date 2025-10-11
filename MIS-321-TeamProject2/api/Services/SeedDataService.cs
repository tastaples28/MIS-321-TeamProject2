using Microsoft.Data.Sqlite;
using OceanFriendlyProductFinder.Services;

namespace OceanFriendlyProductFinder.Services
{
    public class SeedDataService
    {
        private readonly DatabaseService _databaseService;

        public SeedDataService(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task SeedDataAsync()
        {
            using var connection = _databaseService.GetConnection();
            await connection.OpenAsync();

            // Check if data already exists
            var checkProducts = "SELECT COUNT(*) FROM Products";
            using var checkCmd = new SqliteCommand(checkProducts, connection);
            var productCount = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

            if (productCount > 0)
            {
                return; // Data already seeded
            }

            // Seed ingredients first
            await SeedIngredientsAsync(connection);
            
            // Seed products
            await SeedProductsAsync(connection);
        }

        private async Task SeedIngredientsAsync(SqliteConnection connection)
        {
            var ingredients = new[]
            {
                // Reef-safe ingredients
                new { Name = "Zinc Oxide", IsReefSafe = true, BioScore = 95, CoralScore = 98, FishScore = 95, CoverageScore = 90, Description = "Natural mineral sunscreen ingredient" },
                new { Name = "Titanium Dioxide", IsReefSafe = true, BioScore = 90, CoralScore = 95, FishScore = 90, CoverageScore = 85, Description = "Mineral sunscreen ingredient" },
                new { Name = "Coconut Oil", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 80, Description = "Natural moisturizing oil" },
                new { Name = "Shea Butter", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 75, Description = "Natural moisturizing butter" },
                new { Name = "Aloe Vera", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 70, Description = "Natural soothing ingredient" },
                new { Name = "Green Tea Extract", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 60, Description = "Antioxidant-rich natural extract" },
                new { Name = "Vitamin E", IsReefSafe = true, BioScore = 95, CoralScore = 95, FishScore = 95, CoverageScore = 65, Description = "Natural antioxidant" },
                new { Name = "Jojoba Oil", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 70, Description = "Natural moisturizing oil" },
                new { Name = "Chamomile Extract", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 60, Description = "Natural soothing extract" },
                new { Name = "Lavender Oil", IsReefSafe = true, BioScore = 100, CoralScore = 100, FishScore = 100, CoverageScore = 55, Description = "Natural essential oil" },

                // Harmful ingredients
                new { Name = "Oxybenzone", IsReefSafe = false, BioScore = 20, CoralScore = 5, FishScore = 10, CoverageScore = 85, Description = "Chemical sunscreen that damages coral reefs" },
                new { Name = "Octinoxate", IsReefSafe = false, BioScore = 25, CoralScore = 10, FishScore = 15, CoverageScore = 80, Description = "Chemical sunscreen harmful to marine life" },
                new { Name = "Octocrylene", IsReefSafe = false, BioScore = 30, CoralScore = 15, FishScore = 20, CoverageScore = 75, Description = "Chemical sunscreen with environmental concerns" },
                new { Name = "Avobenzone", IsReefSafe = false, BioScore = 35, CoralScore = 20, FishScore = 25, CoverageScore = 70, Description = "Chemical sunscreen ingredient" },
                new { Name = "Homosalate", IsReefSafe = false, BioScore = 40, CoralScore = 25, FishScore = 30, CoverageScore = 65, Description = "Chemical sunscreen with bioaccumulation concerns" },
                new { Name = "Octisalate", IsReefSafe = false, BioScore = 45, CoralScore = 30, FishScore = 35, CoverageScore = 60, Description = "Chemical sunscreen ingredient" },
                new { Name = "Triclosan", IsReefSafe = false, BioScore = 15, CoralScore = 5, FishScore = 10, CoverageScore = 50, Description = "Antimicrobial chemical harmful to marine ecosystems" },
                new { Name = "Sodium Lauryl Sulfate", IsReefSafe = false, BioScore = 50, CoralScore = 40, FishScore = 45, CoverageScore = 80, Description = "Surfactant with environmental persistence" },
                new { Name = "Parabens", IsReefSafe = false, BioScore = 30, CoralScore = 20, FishScore = 25, CoverageScore = 40, Description = "Preservatives with endocrine disruption potential" },
                new { Name = "Microplastics", IsReefSafe = false, BioScore = 0, CoralScore = 0, FishScore = 0, CoverageScore = 90, Description = "Plastic particles harmful to marine life" }
            };

            var insertIngredient = @"
                INSERT INTO Ingredients (Name, IsReefSafe, BiodegradabilityScore, CoralSafetyScore, FishSafetyScore, CoverageScore, Description)
                VALUES (@name, @isReefSafe, @bioScore, @coralScore, @fishScore, @coverageScore, @description)";

            foreach (var ingredient in ingredients)
            {
                using var cmd = new SqliteCommand(insertIngredient, connection);
                cmd.Parameters.AddWithValue("@name", ingredient.Name);
                cmd.Parameters.AddWithValue("@isReefSafe", ingredient.IsReefSafe);
                cmd.Parameters.AddWithValue("@bioScore", ingredient.BioScore);
                cmd.Parameters.AddWithValue("@coralScore", ingredient.CoralScore);
                cmd.Parameters.AddWithValue("@fishScore", ingredient.FishScore);
                cmd.Parameters.AddWithValue("@coverageScore", ingredient.CoverageScore);
                cmd.Parameters.AddWithValue("@description", ingredient.Description);

                await cmd.ExecuteNonQueryAsync();
            }
        }

        private async Task SeedProductsAsync(SqliteConnection connection)
        {
            var products = new[]
            {
                // Eco-friendly products
                new { 
                    Name = "Reef-Safe Mineral Sunscreen SPF 30", 
                    Brand = "OceanGuard", 
                    Category = "Sunscreen", 
                    Description = "Natural mineral sunscreen with zinc oxide, safe for coral reefs and marine life.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/oceanguard-sunscreen",
                    IngredientNames = new[] { "Zinc Oxide", "Coconut Oil", "Aloe Vera", "Vitamin E" }
                },
                new { 
                    Name = "Coral-Friendly Face Wash", 
                    Brand = "MarineCare", 
                    Category = "Face Wash", 
                    Description = "Gentle face wash with natural ingredients that won't harm coral reefs.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/marinecare-facewash",
                    IngredientNames = new[] { "Coconut Oil", "Aloe Vera", "Green Tea Extract", "Chamomile Extract" }
                },
                new { 
                    Name = "Ocean-Safe Shampoo", 
                    Brand = "EcoWaves", 
                    Category = "Shampoo", 
                    Description = "Biodegradable shampoo that's safe for marine ecosystems.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/ecowaves-shampoo",
                    IngredientNames = new[] { "Coconut Oil", "Shea Butter", "Lavender Oil", "Vitamin E" }
                },
                new { 
                    Name = "Reef-Protect Body Wash", 
                    Brand = "BlueLife", 
                    Category = "Body Wash", 
                    Description = "Natural body wash that protects coral reefs and marine life.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/bluelife-bodywash",
                    IngredientNames = new[] { "Aloe Vera", "Jojoba Oil", "Green Tea Extract", "Chamomile Extract" }
                },
                new { 
                    Name = "Marine-Safe Toothpaste", 
                    Brand = "OceanFresh", 
                    Category = "Toothpaste", 
                    Description = "Natural toothpaste without harmful chemicals that affect marine life.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/oceanfresh-toothpaste",
                    IngredientNames = new[] { "Coconut Oil", "Aloe Vera", "Green Tea Extract" }
                },
                new { 
                    Name = "Coral-Care Moisturizer", 
                    Brand = "ReefBeauty", 
                    Category = "Moisturizer", 
                    Description = "Hydrating moisturizer with reef-safe ingredients.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/reefbeauty-moisturizer",
                    IngredientNames = new[] { "Shea Butter", "Jojoba Oil", "Vitamin E", "Aloe Vera" }
                },
                new { 
                    Name = "Ocean-Friendly Lip Balm", 
                    Brand = "SeaKiss", 
                    Category = "Lip Care", 
                    Description = "Natural lip balm that's safe for marine environments.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/seakiss-lipbalm",
                    IngredientNames = new[] { "Coconut Oil", "Shea Butter", "Vitamin E" }
                },
                new { 
                    Name = "Reef-Safe Hand Soap", 
                    Brand = "CleanWaves", 
                    Category = "Hand Soap", 
                    Description = "Biodegradable hand soap that won't harm coral reefs.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/cleanwaves-handsoap",
                    IngredientNames = new[] { "Coconut Oil", "Aloe Vera", "Lavender Oil" }
                },

                // Products with mixed ingredients (moderate scores)
                new { 
                    Name = "Balanced Sunscreen SPF 50", 
                    Brand = "SunGuard", 
                    Category = "Sunscreen", 
                    Description = "Sunscreen with both mineral and chemical ingredients.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/sunguard-sunscreen",
                    IngredientNames = new[] { "Zinc Oxide", "Octinoxate", "Coconut Oil", "Aloe Vera" }
                },
                new { 
                    Name = "Daily Face Cleanser", 
                    Brand = "SkinCare Pro", 
                    Category = "Face Wash", 
                    Description = "Daily cleanser with some synthetic ingredients.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/skincarepro-cleanser",
                    IngredientNames = new[] { "Sodium Lauryl Sulfate", "Aloe Vera", "Green Tea Extract", "Parabens" }
                },
                new { 
                    Name = "Hydrating Shampoo", 
                    Brand = "HairCare Plus", 
                    Category = "Shampoo", 
                    Description = "Moisturizing shampoo with mixed ingredients.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/haircareplus-shampoo",
                    IngredientNames = new[] { "Sodium Lauryl Sulfate", "Coconut Oil", "Shea Butter", "Parabens" }
                },
                new { 
                    Name = "Antibacterial Body Wash", 
                    Brand = "CleanMax", 
                    Category = "Body Wash", 
                    Description = "Body wash with antimicrobial properties.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/cleanmax-bodywash",
                    IngredientNames = new[] { "Triclosan", "Sodium Lauryl Sulfate", "Aloe Vera", "Jojoba Oil" }
                },

                // Products with harmful ingredients (low scores)
                new { 
                    Name = "Ultra Protection Sunscreen SPF 100", 
                    Brand = "SunMax", 
                    Category = "Sunscreen", 
                    Description = "High SPF sunscreen with chemical filters.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/sunmax-sunscreen",
                    IngredientNames = new[] { "Oxybenzone", "Octinoxate", "Octocrylene", "Avobenzone" }
                },
                new { 
                    Name = "Deep Clean Face Scrub", 
                    Brand = "Exfoliate Pro", 
                    Category = "Face Wash", 
                    Description = "Intensive face scrub with microplastics.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/exfoliatepro-scrub",
                    IngredientNames = new[] { "Microplastics", "Sodium Lauryl Sulfate", "Triclosan", "Parabens" }
                },
                new { 
                    Name = "Volumizing Shampoo", 
                    Brand = "VolumeMax", 
                    Category = "Shampoo", 
                    Description = "Shampoo with synthetic volumizing agents.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/volumemax-shampoo",
                    IngredientNames = new[] { "Sodium Lauryl Sulfate", "Parabens", "Triclosan", "Microplastics" }
                },
                new { 
                    Name = "Antibacterial Hand Sanitizer", 
                    Brand = "GermKill", 
                    Category = "Hand Sanitizer", 
                    Description = "Strong antibacterial hand sanitizer.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/germkill-sanitizer",
                    IngredientNames = new[] { "Triclosan", "Parabens", "Microplastics" }
                },
                new { 
                    Name = "Whitening Toothpaste", 
                    Brand = "WhiteMax", 
                    Category = "Toothpaste", 
                    Description = "Toothpaste with whitening chemicals.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/whitemax-toothpaste",
                    IngredientNames = new[] { "Sodium Lauryl Sulfate", "Parabens", "Triclosan" }
                },
                new { 
                    Name = "Anti-Aging Night Cream", 
                    Brand = "AgeDefy", 
                    Category = "Moisturizer", 
                    Description = "Night cream with synthetic anti-aging compounds.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/agedefy-nightcream",
                    IngredientNames = new[] { "Parabens", "Triclosan", "Microplastics" }
                },
                new { 
                    Name = "Long-Lasting Deodorant", 
                    Brand = "StayFresh", 
                    Category = "Deodorant", 
                    Description = "Deodorant with synthetic fragrances and preservatives.",
                    ImageUrl = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/stayfresh-deodorant",
                    IngredientNames = new[] { "Parabens", "Triclosan", "Microplastics" }
                },
                new { 
                    Name = "Color-Protect Hair Mask", 
                    Brand = "ColorGuard", 
                    Category = "Hair Care", 
                    Description = "Hair mask with synthetic color protection agents.",
                    ImageUrl = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=200&fit=crop",
                    ExternalLink = "https://example.com/colorguard-hairmask",
                    IngredientNames = new[] { "Sodium Lauryl Sulfate", "Parabens", "Microplastics", "Triclosan" }
                }
            };

            foreach (var product in products)
            {
                // Insert product
                var insertProduct = @"
                    INSERT INTO Products (Name, Brand, Category, Description, ImageUrl, ExternalLink, 
                                        OceanScore, BiodegradabilityScore, CoralSafetyScore, FishSafetyScore, CoverageScore)
                    VALUES (@name, @brand, @category, @description, @imageUrl, @externalLink, 0, 0, 0, 0, 0)
                    RETURNING Id";

                using var cmd = new SqliteCommand(insertProduct, connection);
                cmd.Parameters.AddWithValue("@name", product.Name);
                cmd.Parameters.AddWithValue("@brand", product.Brand);
                cmd.Parameters.AddWithValue("@category", product.Category);
                cmd.Parameters.AddWithValue("@description", product.Description);
                cmd.Parameters.AddWithValue("@imageUrl", product.ImageUrl);
                cmd.Parameters.AddWithValue("@externalLink", product.ExternalLink);

                var productId = Convert.ToInt32(await cmd.ExecuteScalarAsync());

                // Link ingredients
                foreach (var ingredientName in product.IngredientNames)
                {
                    var getIngredientId = "SELECT Id FROM Ingredients WHERE Name = @name";
                    using var getCmd = new SqliteCommand(getIngredientId, connection);
                    getCmd.Parameters.AddWithValue("@name", ingredientName);
                    
                    var ingredientId = await getCmd.ExecuteScalarAsync();
                    if (ingredientId != null)
                    {
                        var linkIngredient = "INSERT INTO ProductIngredients (ProductId, IngredientId) VALUES (@productId, @ingredientId)";
                        using var linkCmd = new SqliteCommand(linkIngredient, connection);
                        linkCmd.Parameters.AddWithValue("@productId", productId);
                        linkCmd.Parameters.AddWithValue("@ingredientId", ingredientId);
                        await linkCmd.ExecuteNonQueryAsync();
                    }
                }
            }
        }
    }
}

