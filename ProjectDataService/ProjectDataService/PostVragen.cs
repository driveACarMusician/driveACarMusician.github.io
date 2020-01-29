using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using ProjectDataService.Entities;
using ProjectDataService.Models;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PostVragen
    {
        [FunctionName("PostVragen")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "vragen")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                Vraag vraag = JsonConvert.DeserializeObject<Vraag>(json);
                if (vraag == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (vraag.VraagInhoud == null || vraag.VraagInhoud == "") return new OkObjectResult("VraagInhoud werd niet opgegeven");
                if (vraag.Antwoorden == null || vraag.Antwoorden.Count == 0) return new OkObjectResult("Antwoorden werd niet opgegeven");
                if (vraag.Antwoorden.Count != 4) return new OkObjectResult("Er moeten exact 4 antwoorden opgegeven worden");
                if (vraag.LeerkrachtNaam == null || vraag.LeerkrachtNaam == "") return new OkObjectResult("LeerkrachtNaam werd niet opgegeven");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable tableGebruikers = client.GetTableReference("Gebruikers");
                if (!await tableGebruikers.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableGebruikersQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, vraag.LeerkrachtNaam));
                TableQuerySegment<GebruikerEntity> resultGebruikers = await tableGebruikers.ExecuteQuerySegmentedAsync(tableGebruikersQuery, null);
                if (resultGebruikers.Results.Count == 0) return new OkObjectResult("Deze gebruiker bestaat niet");
                CloudTable tableVragen = client.GetTableReference("Vragen");
                await tableVragen.CreateIfNotExistsAsync();
                VraagEntity vraagEntity = new VraagEntity(vraag.VraagInhoud, vraag.Id, vraag.Antwoorden, vraag.LeerkrachtNaam);
                TableOperation tableOperation = TableOperation.Insert(vraagEntity);
                await tableVragen.ExecuteAsync(tableOperation);
                return new OkObjectResult(vraag);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }   
        }
    }
}
