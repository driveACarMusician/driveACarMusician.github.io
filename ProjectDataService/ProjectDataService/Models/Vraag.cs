using System;
using System.Collections.Generic;

namespace ProjectDataService.Models
{
    class Vraag
    {
        public Guid Id { get; set; }
        public string VraagInhoud { get; set; }
        public List<string> Antwoorden { get; set; }
        private string leerkrachtNaam;
        public string LeerkrachtNaam
        {
            get
            {
                return leerkrachtNaam;
            }
            set
            {
                leerkrachtNaam = value.ToLower();
            }
        }

        public Vraag()
        {
            Id = Guid.NewGuid();
        }
    }
}
