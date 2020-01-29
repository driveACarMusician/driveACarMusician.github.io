using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Entities;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class GetVragen
    {
        [FunctionName("GetVragen")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vragen")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string leerkrachtNaam = req.Query["leerkrachtNaam"].ToString().ToLower();
                if (leerkrachtNaam == null || leerkrachtNaam == "") return new OkObjectResult("Parameter \"leerkrachtNaam\" moet opgegeven worden");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTableGebruikers = cloudTableClient.GetTableReference("gebruikers");
                if (!await cloudTableGebruikers.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQueryGebruikers = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, leerkrachtNaam));
                TableQuerySegment<GebruikerEntity> resultGebruikers = await cloudTableGebruikers.ExecuteQuerySegmentedAsync(tableQueryGebruikers, null);
                if (resultGebruikers.Results.Count != 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                CloudTable cloudTableVragen = cloudTableClient.GetTableReference("vragen");
                if (!await cloudTableVragen.ExistsAsync()) return new OkObjectResult("Er zijn nog geen vragen");
                TableQuery<VraagEntity> tableQueryVragen = new TableQuery<VraagEntity>().Where(TableQuery.GenerateFilterCondition("LeerkrachtNaam", QueryComparisons.Equal, leerkrachtNaam));
                TableQuerySegment<VraagEntity> resultVragen = await cloudTableVragen.ExecuteQuerySegmentedAsync(tableQueryVragen, null);
                List<Vraag> vragen = new List<Vraag>();
                foreach (VraagEntity vraagEntity in resultVragen.Results)
                {
                    MemoryStream stream = new MemoryStream();
                    BinaryFormatter binaryFormatter = new BinaryFormatter();
                    stream.Write(vraagEntity.Antwoorden, 0, vraagEntity.Antwoorden.Length);
                    stream.Position = 0;
                    Vraag vraag = new Vraag()
                    {
                        Id = Guid.Parse(vraagEntity.RowKey),
                        VraagInhoud = vraagEntity.PartitionKey,
                        Antwoorden = binaryFormatter.Deserialize(stream) as List<string>,
                        LeerkrachtNaam = vraagEntity.LeerkrachtNaam
                    };
                    vragen.Add(vraag);
                }

                return new OkObjectResult(vragen);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
