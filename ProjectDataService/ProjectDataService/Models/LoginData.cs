namespace ProjectDataService.Models
{
    public class LoginData
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
        public string Wachtwoord { get; set; }
        public string NewPassword { get; set; }
    }
}
