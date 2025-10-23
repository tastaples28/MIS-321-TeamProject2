namespace OceanFriendlyProductFinder.Models
{
    public class AnalyticsLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int? ProductId { get; set; }
        public string Action { get; set; } = string.Empty; // "search", "view", "favorite", "unfavorite"
        public DateTime Timestamp { get; set; }
    }

    public class AnalyticsSummary
    {
        public int TotalSearches { get; set; }
        public int TotalProductViews { get; set; }
        public int TotalFavorites { get; set; }
        public List<ProductAnalytics> TopProducts { get; set; } = new List<ProductAnalytics>();
        public List<IngredientAnalytics> TopIngredients { get; set; } = new List<IngredientAnalytics>();
        public List<CategoryAnalytics> CategoryStats { get; set; } = new List<CategoryAnalytics>();
        public double AverageOceanScore { get; set; }
    }

    public class ProductAnalytics
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int FavoriteCount { get; set; }
        public int OceanScore { get; set; }
    }

    public class IngredientAnalytics
    {
        public int IngredientId { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public int UsageCount { get; set; }
        public bool IsReefSafe { get; set; }
    }

    public class CategoryAnalytics
    {
        public string Category { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public double AverageOceanScore { get; set; }
    }
}

