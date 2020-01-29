using System;

namespace ProjectDataService.Models
{
    public class Leaderboard
    {
        public Guid Id { get; set; }
        public string Naam { get; set; }
        public int MaxScore { get; set; }
        public string Avatar { get; set; }
        
        public Leaderboard(Guid id, string naam, int maxScore, string avatar)
        {
            Id = id;
            Naam = naam;
            MaxScore = maxScore;
            Avatar = avatar;
        }
    }
}
