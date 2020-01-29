using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace ProjectDataService.Entities
{
    public class GebruikerEntity : TableEntity
    {
        public byte[] Scores { get; set; }
        public string Avatar { get; set; }
        public string Auto { get; set; }
        public string TypeGebruiker { get; set; }
        public string Wachtwoord { get; set; }

        public GebruikerEntity()
        {

        }
        public GebruikerEntity(Guid id, string naam, List<int> scores, string avatar, string auto, string typeGebruiker, string wachtwoord)
        {
            PartitionKey = new RemoveUnsupportedCharacters(naam).Result.ToLower();
            RowKey = new RemoveUnsupportedCharacters(id.ToString()).Result;
            MemoryStream stream = new MemoryStream();
            BinaryFormatter binaryFormatter = new BinaryFormatter();
            binaryFormatter.Serialize(stream, scores);
            Scores = stream.ToArray();
            Avatar = avatar;
            Auto = auto;
            TypeGebruiker = typeGebruiker.ToLower();
            Wachtwoord = wachtwoord;
        }
    }
}
