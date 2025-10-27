namespace OceanFriendlyProductFinder.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? ExternalLink { get; set; }
        public int OceanScore { get; set; }
        public int BiodegradabilityScore { get; set; }
        public int CoralSafetyScore { get; set; }
        public int FishSafetyScore { get; set; }
        public int CoverageScore { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    }

    public class ProductCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? ExternalLink { get; set; }
        public List<int> IngredientIds { get; set; } = new List<int>();
        public int? OceanScore { get; set; }
        public int? BiodegradabilityScore { get; set; }
        public int? CoralSafetyScore { get; set; }
        public int? FishSafetyScore { get; set; }
        public int? CoverageScore { get; set; }
    }

    public class ProductSearchRequest
    {
        public string? SearchTerm { get; set; }
        public string? Category { get; set; }
        public string? Brand { get; set; }
        public List<string>? Ingredients { get; set; }
        public int? MinOceanScore { get; set; }
        public int? MaxOceanScore { get; set; }
        public bool? IsReefSafe { get; set; }
        public int? Page { get; set; }
        public int? PageSize { get; set; }
    }

    public class ProductSearchResponse
    {
        public List<Product> Products { get; set; } = new List<Product>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}

