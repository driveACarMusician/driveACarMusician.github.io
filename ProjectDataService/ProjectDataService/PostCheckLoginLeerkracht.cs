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
    public static class PostCheckLoginLeerkracht
    {
        [FunctionName("PostCheckLoginLeerkracht")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "login/leerkracht")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                LoginData loginData = JsonConvert.DeserializeObject<LoginData>(json);
                if (loginData == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (loginData.Naam == null || loginData.Naam == "") return new OkObjectResult("Naam werd niet opgegeven");
                if (loginData.Wachtwoord == null || loginData.Wachtwoord == "") return new OkObjectResult("Wachtwoord werd niet opgegeven");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable table = client.GetTableReference("Gebruikers");
                if (!await table.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, loginData.Naam));
                TableQuerySegment<GebruikerEntity> result = await table.ExecuteQuerySegmentedAsync(tableQuery, null);
                if (result.Results.Count != 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                if (result.Results[0].Wachtwoord != loginData.Wachtwoord) return new OkObjectResult(false);
                return new OkObjectResult(true);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
