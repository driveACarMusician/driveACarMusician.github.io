using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using ProjectDataService.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class DeleteVragen
    {
        [FunctionName("DeleteVraag")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "vragen")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string leerkrachtNaam = req.Query["leerkrachtNaam"].ToString().ToLower();
                if (leerkrachtNaam == null || leerkrachtNaam == "") return new OkObjectResult("Parameter \"leerkrachtNaam\" moet opgegeven worden");
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                List<string> vraagIds = JsonConvert.DeserializeObject<List<string>>(json);
                if (vraagIds == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (vraagIds.Count < 1) return new OkObjectResult("Er moet minstens 1 vraagId opgegeven worden");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = client.GetTableReference("Vragen");
                if (!await cloudTable.ExistsAsync()) return new OkObjectResult("Er zijn nog geen vragen");
                for (int i = 0; i < vraagIds.Count; i++)
                {
                    try
                    {
                        TableQuery<VraagEntity> tableQuery = new TableQuery<VraagEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, vraagIds[i]));
                        TableQuerySegment<VraagEntity> result = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, null);
                        if (result.Results[0].LeerkrachtNaam == leerkrachtNaam)
                        {
                            TableOperation tableOperation = TableOperation.Delete(result.Results[0]);
                            await cloudTable.ExecuteAsync(tableOperation);
                        }
                    }
                    catch (Exception)
                    {
                        //there might be ids that don't exist
                    }
                }
                if (vraagIds.Count == 1) return new OkObjectResult("De vraag is verwijderd");
                else return new OkObjectResult("De vragen zijn verwijderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
