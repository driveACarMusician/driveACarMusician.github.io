using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

namespace ProjectDataService.Entities
{
    public class VraagEntity : TableEntity
    {
        public byte[] Antwoorden { get; set; }
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
        public VraagEntity()
        {

        }
        public VraagEntity(string vraagInhoud, Guid id, List<string> vraagAntwoorden, string leerkrachtNaam)
        {
            PartitionKey = new RemoveUnsupportedCharacters(vraagInhoud).Result;
            RowKey = new RemoveUnsupportedCharacters(id.ToString()).Result;
            MemoryStream stream = new MemoryStream();
            BinaryFormatter binaryFormatter = new BinaryFormatter();
            binaryFormatter.Serialize(stream, vraagAntwoorden);
            Antwoorden = stream.ToArray();
            LeerkrachtNaam = leerkrachtNaam;
        }
    }
}
