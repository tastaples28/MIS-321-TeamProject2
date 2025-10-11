namespace OceanFriendlyProductFinder.Models
{
    public class Ingredient
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsReefSafe { get; set; }
        public int BiodegradabilityScore { get; set; }
        public int CoralSafetyScore { get; set; }
        public int FishSafetyScore { get; set; }
        public int CoverageScore { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class IngredientCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public bool IsReefSafe { get; set; }
        public int BiodegradabilityScore { get; set; }
        public int CoralSafetyScore { get; set; }
        public int FishSafetyScore { get; set; }
        public int CoverageScore { get; set; }
        public string? Description { get; set; }
    }
}

