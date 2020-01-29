namespace ProjectDataService.Models
{
    public class PostScoreClass
    {
        private string naam;
        public string Naam
        {
            get
            {
                return naam;
            }
            set
            {
                naam = value.ToLower();
            }
        }
        public int Score { get; set; }
    }
}
