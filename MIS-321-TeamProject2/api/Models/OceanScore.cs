namespace OceanFriendlyProductFinder.Models
{
    public class OceanScoreWeights
    {
        public int Id { get; set; }
        public double BiodegradabilityWeight { get; set; }
        public double CoralSafetyWeight { get; set; }
        public double FishSafetyWeight { get; set; }
        public double CoverageWeight { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class OceanScoreWeightsUpdateRequest
    {
        public double BiodegradabilityWeight { get; set; }
        public double CoralSafetyWeight { get; set; }
        public double FishSafetyWeight { get; set; }
        public double CoverageWeight { get; set; }
    }

    public class OceanScoreBreakdown
    {
        public int TotalScore { get; set; }
        public int BiodegradabilityScore { get; set; }
        public int CoralSafetyScore { get; set; }
        public int FishSafetyScore { get; set; }
        public int CoverageScore { get; set; }
        public List<string> HarmfulIngredients { get; set; } = new List<string>();
        public List<string> SafeIngredients { get; set; } = new List<string>();
        public string SafetyLevel { get; set; } = string.Empty; // "Safe", "Moderate", "Harmful"
    }
}

