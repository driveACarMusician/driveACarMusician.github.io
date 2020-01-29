using System;
using System.Collections.Generic;

namespace ProjectDataService.Models
{
    public class Gebruiker
    {
        public Guid Id { get; set; }
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
        public List<int> Scores { get; set; }
        public string Avatar { get; set; }
        public string Auto { get; set; }
        private string typeGebruiker;
        public string TypeGebruiker
        {
            get { return typeGebruiker; }
            set { typeGebruiker = value.ToLower(); }
        }
        public string Wachtwoord { get; set; }

        public Gebruiker()
        {
            Id = Guid.NewGuid();
        }
    }
}
