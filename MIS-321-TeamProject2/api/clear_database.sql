-- Clear all data from database tables while keeping the table structure
-- This script will remove all data but preserve the table definitions

-- Disable foreign key checks temporarily to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from tables (in reverse dependency order)
TRUNCATE TABLE AnalyticsLog;
TRUNCATE TABLE UserFavorites;
TRUNCATE TABLE ProductIngredients;
TRUNCATE TABLE Products;
TRUNCATE TABLE Ingredients;
TRUNCATE TABLE Users;
TRUNCATE TABLE OceanScoreWeights;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert default admin user
INSERT INTO Users (Username, Email, PasswordHash, IsAdmin)
VALUES ('admin', 'admin@oceanfriendly.com', 'admin123', 1);

-- Insert default Ocean Score weights
INSERT INTO OceanScoreWeights (BiodegradabilityWeight, CoralSafetyWeight, FishSafetyWeight, CoverageWeight)
VALUES (0.30, 0.30, 0.25, 0.15);

-- Show confirmation
SELECT 'Database cleared successfully. Default admin user and weights have been restored.' as Status;
