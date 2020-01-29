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
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PostGebruiker
    {
        [FunctionName("PostGebruiker")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gebruikers")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                Gebruiker gebruiker = JsonConvert.DeserializeObject<Gebruiker>(json);
                if (gebruiker == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (gebruiker.Naam == null || gebruiker.Naam == "") return new OkObjectResult("Naam werd niet opgegeven");
                if (gebruiker.TypeGebruiker == null || gebruiker.TypeGebruiker == "") return new OkObjectResult("TypeGebruiker werd niet opgegeven");
                if (gebruiker.TypeGebruiker.ToLower() == "leerkracht" && (gebruiker.Wachtwoord == null || gebruiker.Wachtwoord == "")) return new OkObjectResult("Password werd niet opgegeven");
                gebruiker.Scores = new List<int>(); //make sure the new user has no scores (that's cheating :/)
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable table = client.GetTableReference("Gebruikers");
                await table.CreateIfNotExistsAsync();
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, gebruiker.Naam));
                TableQuerySegment<GebruikerEntity> result = await table.ExecuteQuerySegmentedAsync(tableQuery, null);
                if (result.Results.Count > 0) return new OkObjectResult("Gebruikersnaam is al in gebruik");
                GebruikerEntity gebruikerEntity = new GebruikerEntity(gebruiker.Id, gebruiker.Naam, gebruiker.Scores, gebruiker.Avatar, gebruiker.Auto, gebruiker.TypeGebruiker, gebruiker.Wachtwoord);
                TableOperation tableOperation = TableOperation.Insert(gebruikerEntity);
                await table.ExecuteAsync(tableOperation);
                gebruiker.Wachtwoord = ""; //never return a password!
                return new OkObjectResult(gebruiker);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
