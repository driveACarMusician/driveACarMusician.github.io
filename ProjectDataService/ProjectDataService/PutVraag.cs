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
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PutVraag
    {
        [FunctionName("PutVraag")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "vragen")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                Vraag vraag = JsonConvert.DeserializeObject<Vraag>(json);
                if (vraag == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (vraag.Id == null || vraag.Id.ToString() == "") return new OkObjectResult("Id werd niet opgegeven");
                if (vraag.VraagInhoud == null || vraag.VraagInhoud == "") return new OkObjectResult("VraagInhoud werd niet opgegeven");
                if (vraag.Antwoorden == null || vraag.Antwoorden.Count == 0) return new OkObjectResult("Antwoorden werd niet opgegeven");
                if (vraag.LeerkrachtNaam == null || vraag.LeerkrachtNaam == "") return new OkObjectResult("LeerkrachtNaam werd niet opgegeven");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTableGebruikers = cloudTableClient.GetTableReference("gebruikers");
                if (!await cloudTableGebruikers.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQueryGebruikers = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, vraag.LeerkrachtNaam));
                TableQuerySegment<GebruikerEntity> resultGebruikers = await cloudTableGebruikers.ExecuteQuerySegmentedAsync(tableQueryGebruikers, null);
                if (resultGebruikers.Results.Count != 1) return new OkObjectResult("Deze gebruiker bestaat niet");
                CloudTable cloudTableVragen = cloudTableClient.GetTableReference("vragen");
                if (!await cloudTableVragen.ExistsAsync()) return new OkObjectResult("Er zijn nog geen vragen");
                TableQuery<VraagEntity> tableQueryVragen = new TableQuery<VraagEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, vraag.Id.ToString()));
                TableQuerySegment<VraagEntity> resultVragen = await cloudTableVragen.ExecuteQuerySegmentedAsync(tableQueryVragen, null);
                VraagEntity vraagEntity = resultVragen.Results[0];
                if (resultVragen.Results.Count != 1) return new OkObjectResult("Deze vraag bestaat niet");
                TableOperation tableOperationDelete = TableOperation.Delete(vraagEntity);
                await cloudTableVragen.ExecuteAsync(tableOperationDelete);
                vraagEntity.PartitionKey = new RemoveUnsupportedCharacters(vraag.VraagInhoud).Result;
                MemoryStream stream = new MemoryStream();
                BinaryFormatter binaryFormatter = new BinaryFormatter();                
                binaryFormatter.Serialize(stream, vraag.Antwoorden);
                byte[] antwoorden = stream.ToArray();
                vraagEntity.Antwoorden = antwoorden;
                //LeerkrachtNaam is not changed because teachers can only change their own questions
                TableOperation tableOperationInsert = TableOperation.Insert(vraagEntity);
                await cloudTableVragen.ExecuteAsync(tableOperationInsert);
                return new OkObjectResult("De vraag is veranderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
