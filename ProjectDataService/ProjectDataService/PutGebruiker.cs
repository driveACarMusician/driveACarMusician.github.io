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
    public static class PutGebruiker
    {
        [FunctionName("PutGebruiker")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "gebruikers")] HttpRequest req,
            ILogger log)
        {
            //deze functie PutGebruiker kan de avatar en auto van een gebruiker aanpassen
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                Gebruiker gebruiker = JsonConvert.DeserializeObject<Gebruiker>(json);
                if (gebruiker.Naam == null || gebruiker.Naam == "") return new OkObjectResult("Naam werd niet opgegeven");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = cloudTableClient.GetTableReference("gebruikers");
                if (!await cloudTable.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, gebruiker.Naam));
                TableQuerySegment<GebruikerEntity> result = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, null);
                if (result.Results.Count != 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                GebruikerEntity gebruikerEntity = result.Results[0];
                if (gebruiker.Avatar != null && gebruiker.Avatar != "") gebruikerEntity.Avatar = gebruiker.Avatar;
                if (gebruiker.Auto != null && gebruiker.Auto != "") gebruikerEntity.Auto = gebruiker.Auto;
                TableOperation tableOperation = TableOperation.InsertOrMerge(gebruikerEntity);
                await cloudTable.ExecuteAsync(tableOperation);
                return new OkObjectResult("De gegevens van de gebruiker zijn aangepast");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
