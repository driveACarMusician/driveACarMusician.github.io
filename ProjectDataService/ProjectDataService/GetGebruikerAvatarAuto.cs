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
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class GetGebruikerAvatarAuto
    {
        [FunctionName("GetGebruikerAvatarAuto")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "gebruikers")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string naam = req.Query["naam"].ToString().ToLower();
                if (naam == null || naam == "") return new OkObjectResult("Parameter \"naam\" moet opgegeven worden");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTableVragen = cloudTableClient.GetTableReference("gebruikers");
                if (!await cloudTableVragen.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, naam));
                TableQuerySegment<GebruikerEntity> result = await cloudTableVragen.ExecuteQuerySegmentedAsync(tableQuery, null);
                if (result.Results.Count < 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                GebruikerEntity gebruikerEntity = result.Results[0];
                Gebruiker gebruiker = new Gebruiker()
                {
                    Id = Guid.Parse(gebruikerEntity.RowKey),
                    Naam = gebruikerEntity.PartitionKey,
                    Avatar = gebruikerEntity.Avatar,
                    Auto = gebruikerEntity.Auto
                };
                return new OkObjectResult(gebruiker);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
