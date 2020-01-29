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
    public static class PutLeerkrachtLogin
    {
        [FunctionName("PutLeerkrachtLogin")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "gebruikers")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                LoginData loginData = JsonConvert.DeserializeObject<LoginData>(json);
                if (loginData == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (loginData.Naam == null || loginData.Naam == "") return new OkObjectResult("Naam werd niet opgegeven");
                if (loginData.Wachtwoord == null || loginData.Wachtwoord == "") return new OkObjectResult("Wachtwoord werd niet opgegeven");
                if (loginData.NewPassword == null || loginData.NewPassword == "") return new OkObjectResult("NewPassword werd niet opgegeven");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = cloudTableClient.GetTableReference("Gebruikers");
                if (!await cloudTable.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, loginData.Naam));
                TableQuerySegment<GebruikerEntity> result = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, null);
                GebruikerEntity gebruiker = result.Results[0];
                if (result.Results.Count != 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                if (gebruiker.Wachtwoord != loginData.Wachtwoord) return new OkObjectResult("Het wachtwoord is niet juist");
                LoginDataEntity loginDataEntity = new LoginDataEntity(gebruiker.RowKey, gebruiker.PartitionKey, loginData.NewPassword);
                TableOperation tableOperation = TableOperation.InsertOrMerge(loginDataEntity);
                await cloudTable.ExecuteAsync(tableOperation);
                return new OkObjectResult("Het wachtwoord is veranderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
