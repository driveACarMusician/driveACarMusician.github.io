using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Entities;
using System;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PostCheckIfGebruikerExists
    {
        [FunctionName("PostCheckIfGebruikerExists")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "gebruikers/check")] HttpRequest req,
            ILogger log)
        {
            string gebruikerNaam = req.Query["naam"].ToString().ToLower();
            if (gebruikerNaam == null || gebruikerNaam == "") return new OkObjectResult("Parameter \"naam\" moet opgegeven worden");
            string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
            CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
            CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
            CloudTable cloudTable = client.GetTableReference("gebruikers");
            if (!await cloudTable.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
            TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, gebruikerNaam));
            TableQuerySegment<GebruikerEntity> result = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, null);
            if (result.Results.Count == 0) return new OkObjectResult(false);
            return new OkObjectResult(true);
        }
    }
}
